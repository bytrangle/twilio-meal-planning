const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('coo')
// const { MessagingResponse } = require('twilio').twiml
const MessagingResponse = require('twilio/lib/twiml/MessagingResponse')
const fs = require('fs')
const path = require('path')
const AppService = require('./AppService')
const { dateToISO } = require('./utils')
const constants = require('./constants')
const appService = new AppService()
const { USER_STATS_FILE } = constants

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.cookieParser())

app.get('/', (req, res) => {
  // return appService.getHello(...args)
  res.type('text/html').send('This is a server for processing your meal plan request')
})

app.post('/', (req, res) => {
  console.log(req.cookies)
  const { Body, From, ProfileName } = req.body
  const today = dateToISO(new Date())
  // let userStats = {}
  // if (fs.existsSync(USER_STATS_FILE)) {
  //   userStats = JSON.parse(fs.readFileSync(USER_STATS_FILE, 'utf8'))
  //   if (userStats[today] && userStats[today][From]) {
  //     // The sender has made at least a request today
  //     if (userStats[today][From] >= 2) {
  //       throw new Error('You have reached the maximum number of messages to the chat bot for today. Please come back tomorrow.')
  //     } else {
  //       userStats[today][From]++
  //     }
  //   } else if (userStats[today]) {
  //     // There is an entry for today, but this sender hasn't made a request
  //     userStats[today][From] = 1
  //   } else {
  //     // We only have data from previous days, which is no longer relevant
  //     for (const prop of Object.getOwnPropertyNames(userStats)) {
  //       delete userStats[prop]
  //     }
  //     userStats[today] = {}
  //     userStats[today][From] = 1
  //   }
  // } else {
  //   // This file doesn't exist yet. We need to populate its content
  //   userStats[today] = {
  //     [From]: 1
  //   }
  // }
  // fs.writeFileSync(USER_STATS_FILE, JSON.stringify(userStats))

  // if (Body !== '') {
  //   const resp = appService.reply(`Hello ${ProfileName}, Please share your location with us to recommend Vegan restaurants around you :)`)
  //   return resp.type('text/xml').send(resp.toString())
  // } 
  // else {
    const errorMessage = ''
    let mealPlan = []
    let mealPlanSize = 1
    const twiml = new MessagingResponse()
    appService.constructMealPlanRequest(Body)
    .then((result) => {
      const chatbotResp = result.data
      if (!chatbotResp.request && !chatbotResp.request.body) {
        throw new Error('Sorry, your request is invalid.')
      }
      const requestToMealPlanAPI = chatbotResp.request
      if (requestToMealPlanAPI.body.size) {
        mealPlanSize = requestToMealPlanAPI.body.size
      }
      console.log({ mealPlanSize })
      return appService.requestMealPlan(requestToMealPlanAPI)
    })
    .finally(() => {
      console.log("Updating user stats")
    })
    .then((mealPlanResp) => {
      mealPlan = mealPlanResp.data.selection
      if (mealPlan.length === 0) {
        throw new Error('Sorry, meal plan can\'t be generated')
      }
      console.log({ mealPlan })
      let mealPlanWithSections = []
      let uriList = []
      if (mealPlan[0].sections) {
        uriList = mealPlan.reduce((accumulator, curDay) => {
          const { sections } = curDay
          for (const mealType in sections) {
            // accumulator[m]
            accumulator.push(sections[mealType].assigned)
          }
          return accumulator
        }, [])
      } else {
        // The meal plan just has links and is not divided into sections
        uriList = mealPlan.map(recipe => recipe.assigned)
      }
      console.log({ uriList})
      // const URIToObjectPath = {}
      // for (let i = 0; i < mealPlan.length; i++) {
      //   const { sections } = mealPlan[i]
      //   for (const mealType in sections) {
      //     if (sections[mealType].assigned) {
      //       const recipeURI = sections[mealType].assigned
      //       const path = `${i}.sections.${mealType}`
      //       URIToObjectPath[recipeURI] = path
      //       recipeURIList.push()
      //     }
      //   }
      // }
      // console.log(recipeURIList)
      // console.log(URIToObjectPath)
      // if (recipeURIList.length > 20) {
      //   throw new Error('Oops, you can only request a maxiumum of 20 recipes')
      // }
      return appService.getRecipesByURI(uriList)
    })
    .then((resp) => {
      console.log(resp)
      const respFromRecipeAPI = resp.data
      let message = 'Your meal plan has been created'
      if (!respFromRecipeAPI.hits || !respFromRecipeAPI.hits.length) {
        message = 'Failed to retrieve recipes. Please contact chatbot author for help'
      }
      twiml.message(message)
      res.type('text/xml').send(twiml.toString())
    })
    .catch((error) => {
      console.log(error)
      twiml.message(error)
      res.type('text/xml').send(twiml.toString())
    })
})

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})