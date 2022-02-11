/* Sending emails to users when they sign up and when they leave the app. */
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "adem.kafia@esprit.tn",
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
    });
};

const sendGoodbyeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: "adem.kafia@esprit.tn",
        subject: "We are really sad",
        text: `Hi ${name}, we are really sad that you left us, and we are wondering what could we done better to make your experience better`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeMail,
};
