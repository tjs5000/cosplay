#!/usr/bin/env python3

import cgi
import cgitb
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

cgitb.enable()  # Enable error logging for debugging

# Email server configuration
SMTP_SERVER = "smtp.burstingattheseams.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "sscp@burstingattheseams.com"  # Replace with your email
EMAIL_PASSWORD = "ipaSparkyturned5%"  # Replace with your email password

print("Content-type: text/html\n")  # Required for CGI scripts

def send_contact_form(name, email, subject, message):
    try:
        # Create the email
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = EMAIL_ADDRESS
        msg["Subject"] = f"New Contact Form Submission: {subject}"

        # Email body
        body = f"""
        You have received a new contact form submission:
        
        Name: {name}
        Email: {email}
        Subject: {subject}
        Message:
        {message}
        """
        msg.attach(MIMEText(body, "plain"))

        # Connect to the SMTP server
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        return "Email sent successfully!"

    except Exception as e:
        return f"An error occurred: {e}"

# Get form data
form = cgi.FieldStorage()
name = form.getvalue("name")
email = form.getvalue("email")
subject = form.getvalue("subject")
message = form.getvalue("message")

# Send the email
response = send_contact_form(name, email, subject, message)

# Return response to the browser
print(f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Contact Form</title>
</head>
<body>
    <h1>{response}</h1>
    <p><a href="/">Go Back</a></p>
</body>
</html>
""")
