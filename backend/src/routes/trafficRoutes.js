import express from 'express'
const router = express.Router()

const TOMTOM_KEY = process.env.TOMTOM_API_KEY

// GET /api/traffic?lat=X&lon=Y
router.get('/', async (req, res) => {
  const { lat, lon } = req.query

  if (!lat || !lon) {
    return res.status(400).json({ success: false, error: 'lat and lon are required' })
  }

  if (!TOMTOM_KEY) {
    return res.status(500).json({ success: false, error: 'TomTom API key not configured' })
  }

  try {
    const radius = 5000 // 5km radius around rider's location

    // TomTom Traffic Incidents API — nearby incidents within radius
    const incidentUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TOMTOM_KEY}&bbox=${parseFloat(lon) - 0.05},${parseFloat(lat) - 0.05},${parseFloat(lon) + 0.05},${parseFloat(lat) + 0.05}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&language=en-GB&timeValidityFilter=present`

    // TomTom Traffic Flow — congestion on nearest road segment
    const flowUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&key=${TOMTOM_KEY}`

    const [incidentRes, flowRes] = await Promise.allSettled([
      fetch(incidentUrl),
      fetch(flowUrl),
    ])

    // Parse incidents — filter to significant only (magnitude >= 2 = moderate/major delay)
    let incidents = []
    if (incidentRes.status === 'fulfilled' && incidentRes.value.ok) {
      const data = await incidentRes.value.json()
      incidents = (data.incidents || [])
        .map(inc => ({
          id:          inc.properties?.id,
          category:    inc.properties?.iconCategory,
          magnitude:   inc.properties?.magnitudeOfDelay ?? 0, // 0=unknown,1=minor,2=moderate,3=major,4=undefined
          description: inc.properties?.events?.[0]?.description || 'Incident reported',
          from:        inc.properties?.from || null,
          to:          inc.properties?.to   || null,
          roadNumbers: inc.properties?.roadNumbers?.join(', ') || null,
          delay:       inc.properties?.delay || 0, // seconds of delay
        }))
        .filter(inc => inc.magnitude >= 2) // only moderate+ delays
        .sort((a, b) => b.magnitude - a.magnitude || b.delay - a.delay) // most serious first
        .slice(0, 5) // top 5
    }

    // Parse flow (congestion)
    let flow = null
    if (flowRes.status === 'fulfilled' && flowRes.value.ok) {
      const data = await flowRes.value.json()
      const seg = data.flowSegmentData
      if (seg) {
        flow = {
          currentSpeed:   seg.currentSpeed,   // km/h
          freeFlowSpeed:  seg.freeFlowSpeed,  // km/h
          confidence:     seg.confidence,
          congestionRatio: seg.freeFlowSpeed > 0
            ? Math.round((1 - seg.currentSpeed / seg.freeFlowSpeed) * 100)
            : 0,
        }
      }
    }

    res.json({ success: true, data: { incidents, flow } })
  } catch (err) {
    console.error('Traffic fetch error:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch traffic data' })
  }
})

export default router
