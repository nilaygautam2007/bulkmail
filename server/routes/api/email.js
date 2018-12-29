var helper = require('sendgrid').mail;
const async = require('async');
const { convertCSVToArray } = require('convert-csv-to-array');
const converter = require('convert-csv-to-array');
var emaillist = [
"nilay@shaastra.org"
];

// "py@shaastra.org"
// var slicedmail = emaillist.slice(10001,12000); also change variable name in callback


var del = 0;
var notdel = 0;
var notsentarray = [];
var sentarray = [];
function sendEmail(
    parentCallback,
    fromEmail,
    toEmails,
    subject,
    // textContent,
    htmlContent
  ) {
    const errorEmails = [];
    const successfulEmails = [];
const sg = require('sendgrid')('Enter sendgrid secret here');
async.parallel([
      function(callback) {
        // Add to emails
        for (let i = 0; i < toEmails.length; i += 1) {
          // Add from emails
          const senderEmail = new helper.Email(fromEmail);
          // Add to email
          const toEmail = new helper.Email(toEmails[i]);
          // const replyEmail = new helper.Email(replyTo);
          // HTML Content
          const content = new helper.Content('text/html', htmlContent);
          const mail = new helper.Mail(senderEmail, subject, toEmail, content);
          var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
          });
          sg.API(request, function (error, response) {
            console.log('SendGrid');
            if (error) {
              notdel = notdel + 1;
              notsentarray.push(toEmails[i]);
              console.log('Error response received');
            }
            else{
              del = del + 1;
              sentarray.push(toEmails[i]);
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
            console.log("Delivered",sentarray);
            console.log("Not delivered",notsentarray);
          });
        }
        // return
        callback(null, true);
      }
    ], function(err, results) {
      console.log('Done');
    });
    parentCallback(null,
      {
        successfulEmails: successfulEmails,
        errorEmails: errorEmails,
      }
    );
}
var text = "<html><body><b>Greetings from Shaastra,</b><br><br> Here is a chance for your students to pick up handy technical skills at one of our workshops! At Shaastra, we believe learning should be made as easy as possible and as a part of that endeavour, we present you with a set of workshops designed to equip tech-savvy students (or anyone who is interested) with the basics in their chosen subject, along with an overall picture of how the field is doing in the contemporary world, and what scope it has in the future. Here is a list of the workshops we shall be conducting.<br><br> "+"<b>Workshops:</b><ul><li><b>TradeX:</b> Do you want to learn how to make money in the stock market, but do not know where to start? Do you passionately want to become the next 'Warren Buffett'? Do you want to analyze a company based on its financial numbers and figures? Learn about all the major topics in this workshops.<br>Register at:<a href='  https://www.shaastra.org/TradeX' target='_blank'>   https://www.shaastra.org/TradeX</a><br><ul><li>For any finance enthusiasts </li><li>Learn the ins and outs of stock markets. </li><li>Analyze companies based on their financial statistics. </li></ul></li></ul></ul>"+ "<br><br>You can find more details and register in <a href=' https://www.shaastra.org/workshops' target='_blank'> https://www.shaastra.org/workshops</a><br><br><br>Please circulate the same in your institution. We will be providing accommodations, depending on their availability, for which reason, we suggest early registrations. It will be a great learning experience, and a fun-filled chance to interact with like and bright-minded individuals. This will be a great addition to your resume. Looking forward to meet you at Shaastra 2019.<br><br><br>Regards <br>Team Shaastra 2019<br>IIT Madras<br><br>"+"</body></html>";

module.exports = (app) => {
  app.post('/api/send', function (req, res, next) {
    async.parallel([
      function (callback) {
        sendEmail(
          callback,
          'webops@shaastra.org',
          emaillist,
          'Workshops, Shaastra 2019',
          // 'Text Content',
          text
        );
      }
    ], function(err, results) {
      res.send({
        success: true,
        message: 'Emails sent',
        successfulEmails: results[0].successfulEmails,
        errorEmails: results[0].errorEmails,
        delivered: del,
        notdelivered: notdel
      });
    });
 });
};
