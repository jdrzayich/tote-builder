
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

    // --- NEW: include the quote items (from your builder)
    const items = body?.items;
    const estimate = body?.estimate;
    const zip = body?.zip;
    const notes = body?.notes;

    const itemsHtml = Array.isArray(items)
      ? `<ol>${items
        .map((it: any) => {
          const meta = it?.meta || {};
          const addons = Array.isArray(meta?.addons) ? meta.addons : [];
          return `
            <li>
              <div><b>${escapeHtml(it?.title ?? "Item")}</b> — Est. ${it?.estTotal ?? ""}</div>
              <div>Size: ${meta?.cols ?? "?"} across × ${meta?.rows ?? "?"} tall (${meta?.totalBays ?? "?"} bays)</div>
              ${addons.length ? `<div>Add-ons: ${escapeHtml(addons.join(", "))}</div>` : `<div>Add-ons: (none)</div>`}
              <div>Wall: ${meta?.wallWidthIn ?? "?"}" W × ${meta?.wallHeightIn ?? "?"}" H</div>
              <div>Tote: ${escapeHtml(meta?.toteType ?? "")} • ${escapeHtml(meta?.orientation ?? "")}</div>
            </li>
          `;
       })
      .join("")}</ol>`
  : "<p>(no items)</p>";

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
        ${zip ? `<p><b>ZIP:</b> ${escapeHtml(zip)}</p>` : ""}
        ${estimate != null ? `<p><b>Estimated total:</b> ${estimate}</p>` : ""}

        <hr/>
        <h3>Quote Items</h3>
        ${itemsHtml}

        ${notes ? `<hr/><p><b>Notes:</b><br/>${escapeHtml(notes)}</p>` : ""}
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
function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
