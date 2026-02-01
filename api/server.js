import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: ["https://plumbazing.com", "https://www.plumbazing.com"],
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"]
}));

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/api/request", async (req, res) => {
  try {
	const { name, phone, email, address, time, details } = req.body;

	// Basic validation
	if (!name || !phone || !details) {
	  return res.status(400).json({ ok: false, error: "Missing required fields." });
	}

	// Configure SMTP (recommended: SendGrid or Mailgun)
	const transporter = nodemailer.createTransport({
	  host: process.env.SMTP_HOST,
	  port: Number(process.env.SMTP_PORT || 587),
	  secure: false,
	  auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	  }
	});

	const officeTo = "office@plumbazing.com";

	// 1) Email to office
	await transporter.sendMail({
	  from: process.env.MAIL_FROM, // e.g. "PlumbAZing <no-reply@pumbazing.com>"
	  to: officeTo,
	  replyTo: email || undefined,
	  subject: `New Service Request — ${name}${phone ? ` (${phone})` : ""}`,
	  text:
`New service request:

Name: ${name}
Phone: ${phone}
Email: ${email || "(not provided)"}
Address: ${address || "(not provided)"}
Preferred Time: ${time || "(not provided)"}

Issue:
${details}
`
	});

	// 2) Confirmation to customer (only if they provided email)
	if (email) {
	  await transporter.sendMail({
		from: process.env.MAIL_FROM,
		to: email,
		subject: "We got your request — PlumbAZing",
		text:
`Hi ${name},

Thanks for reaching out to PlumbAZing — we received your request and will contact you shortly.

Summary:
${details}

If it’s urgent, call or text us at (512) 888-4406.

— PlumbAZing
pumbazing.com
`
	  });
	}

	return res.json({ ok: true });
  } catch (err) {
	console.error(err);
	return res.status(500).json({ ok: false, error: "Server error." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on ${port}`));
