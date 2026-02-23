
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // required fields
    const name = body?.name;
    const email = body?.email;
    const phone = body?.phone;

    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: "Missing name/email/phone" }), { status: 400 });
    }

    const rows = body?.rows;
    const cols = body?.cols;
    const includeWheels = !!body?.includeWheels;
    const includePlywoodTop = !!body?.includePlywoodTop;

    const { error } = await resend.emails.send({
      from: "Tote Builder <onboarding@resend.dev>",
      to: ["jake@rackyourgarage.com"],
      replyTo: email,
      subject: `New Tote Builder Lead: ${name}`,
      html: `
        <h2>New Tote Builder Lead</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <hr/>
        <h3>Build</h3>
        <p><b>Rows:</b> ${rows ?? "(not provided)"}</p>
        <p><b>Cols:</b> ${cols ?? "(not provided)"}</p>
        <p><b>Wheels:</b> ${includeWheels ? "Yes" : "No"}</p>
        <p><b>Plywood Top:</b> ${includePlywoodTop ? "Yes" : "No"}</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), { status: 500 });
  }
}
