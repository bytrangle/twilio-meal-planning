const express = require('express')
const bodyParser = require('body-parser')
// const { MessagingResponse } = require('twilio').twiml
const AppService = require('./AppService')
const MessagingResponse = require('twilio/lib/twiml/MessagingResponse')
const appService = new AppService()

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  // return appService.getHello(...args)
  res.type('text/html').send('This is a server for processing your meal plan request')
})

app.post('/', (req, res) => {
  const { Body, ProfileName } = req.body
  // if (Body !== '') {
  //   const resp = appService.reply(`Hello ${ProfileName}, Please share your location with us to recommend Vegan restaurants around you :)`)
  //   return resp.type('text/xml').send(resp.toString())
  // } 
  // else {
    const twiml = new MessagingResponse()
    appService.constructMealPlanRequest(Body)
    .then((result) => {
      const resp = result.data
      console.log({ resp })
      twiml.message('Your meal plan has been created');
      res.type('text/xml').send(twiml.toString())
    })
    .catch((error) => {
      console.log(error.response.data)
      twiml.message('Your request can\'t be processed.')
      res.type('text/xml').send(twiml.toString())
    })
})

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})