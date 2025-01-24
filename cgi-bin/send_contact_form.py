#!/usr/bin/env python

import cgi
import cgitb
import smtplib
import json
from email.mime.text import MIMEText

cgitb.enable()  # Enable error logging for debugging

# Email server configuration
SMTP_SERVER = "smtp.burstingattheseams.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "sscp@burstingattheseams.com"  # Replace with your email
EMAIL_PASSWORD = "ipaSparkyturned5%"  # Replace with your email password

print("Content-type: application/json\n")  # Set correct content type

def send_contact_form(name, email, subject, message):
    try:
        # Create the email
        body = """
        This email is from the SSCP Contact Form. Do not reply to this email.
        
        Name: %s
        Email: %s
        Subject: %s
        Message:
        %s
        """ % (name, email, subject, message)
        msg = MIMEText(body)
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = EMAIL_ADDRESS
        msg["Subject"] = "SSCP Contact Form Submission: %s" % subject

        # Connect to the SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)  # Login to the server
        server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg.as_string())  # Send the email
        server.quit()  # Disconnect from the server

        return True

    except Exception as e:
        return False

# Get form data
form = cgi.FieldStorage()
name = form.getvalue("name")
email = form.getvalue("email")
subject = form.getvalue("subject")
message = form.getvalue("message")

# Send the email
email_sent = send_contact_form(name, email, subject, message)

# Redirect the user
if email_sent:
    response = {"status": "success", "redirect": "/?c=sent"} if email_sent else {"status": "error", "redirect": "/?c=error"}

print(json.dumps(response))