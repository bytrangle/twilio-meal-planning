require('dotenv').config()
const { Twilio, twiml } = require('twilio')
const axios = require('axios')

const { MessagingResponse } = twiml

const ASSISTANT_URL = 'https://api.edamam.com/api/assistant/v1/query'

class AppService {
  constructor() {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    this.edamamInstance = axios.create({
      baseURL: 'https://api.edamam.com/api/',
      auth: {
        username: process.env.EDAMAM_APP_ID,
        password: process.env.EDAMAM_APP_KEY
      },
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Edamam-Account-User': process.env.EDAMAM_USER
      }
    })
  }
  getHello(req, res) {
    res.send('Hello world')
  }
  reply(message) {
    const response = new MessagingResponse()
    response.message(message)
    return response.toString()
  }
  constructMealPlanRequest(message) {
    console.log({ message })
    const data = {
    "options": {
      "calls": [
        "calculate_meal_plan"
      ]
    },
    "exchange": [
      {
        "query": message
      }
    ]
  }
    return this.edamamInstance.post('/assistant/v1/query', JSON.stringify(data))
  }

  requestMealPlan(requestToMealPlanAPI) {
    const { uri, body } = requestToMealPlanAPI
    console.log({ uri })
    console.log({ body })
    return this.edamamInstance.post(uri, JSON.stringify(body))
  }
  getRecipesByURI(uriList) {
    return this.edamamInstance.get('/recipes/v2/by-uri', {
      params: {
        type: 'public',
        uri: uriList,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        field: ['label', 'source', 'url', 'mealType']
      },
      paramsSerializer: {
        indexes: null
      }
    })
  }
}

module.exports = AppService