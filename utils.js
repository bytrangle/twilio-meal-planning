function dateToISO(date) {
  let realMonth = date.getMonth() + 1
  const monthAsString = realMonth < 10 ? `0${realMonth}` : `${realMonth}`
  return `${date.getFullYear()}-${monthAsString}-${date.getDate()}`
}

function createHtmlEmail(data, recipient, request) {
  const recipes = data.hits
  let emailMessage = `<div style="margin:0 auto;max-width:600px;width:100%"><p>Hi ${recipient}. You requested <em>${request}</em>. Here's your menu:</p>`
  for (let i = 0; i < recipes.length; i++) {
    const { recipe } = recipes[i]
    emailMessage += `<h2>Day ${i + 1}</h2>`
    emailMessage += `<p><a href="${recipe.url}" style="color:#e33d26;text-decoration:underline" target="_blank">${recipe.label}</a> from <i>${recipe.source}</i></p>`
    const image = `
      <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
        <tbody>
          <tr>
            <td>
              <img width="600" height="450" src="${recipe.image}" alt="Image of ${recipe.label}" style="width:100%;height:auto;display:block;padding-top:10px;padding-bottom:5px" />
            </td>
          </tr>
        </tbody>
      </table>
    `
    emailMessage += image
    const bottomBorder = `
      <table width="100%"><tbody><tr><td class="m_-8603625285007895294css-1ux4czy" style="padding-bottom:15px"></td></tr><tr><td style="border-top:1px solid #dcdcdc;padding-bottom:15px"></td></tr></tbody></table>
    `
    emailMessage += bottomBorder
  }
  // Add the closing `</div> tag to the email body
  emailMessage += `</div>`
  return emailMessage
}

exports.dateToISO = dateToISO
exports.createHtmlEmail = createHtmlEmail