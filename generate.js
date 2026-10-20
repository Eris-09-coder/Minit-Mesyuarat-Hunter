const SYSTEM_PROMPT = `
Anda ialah pembantu penyediaan minit mesyuarat rasmi sekolah di Malaysia.
Tugas: susun nota pengguna menjadi teks agenda/minit yang kemas untuk dimasukkan ke dalam templat sedia ada.
Peraturan wajib:
- Jangan cipta atau meneka nama, tarikh, masa, kehadiran, keputusan, nombor, tempat, atau tindakan.
- Kekalkan semua fakta, maksud, keputusan, pemilik tindakan dan tarikh akhir daripada sumber.
- Jika fakta tidak diberi, biarkan kosong atau tulis [PERLU DIISI] hanya jika benar-benar perlu.
- Jangan tambah agenda generik yang tidak terdapat dalam sumber.
- Kekalkan bahasa sumber melainkan arahan pengguna meminta bahasa lain.
- Kekalkan nombor agenda sedia ada jika diberi. Jika nota tidak bernombor, susun dengan nombor ringkas tanpa mengubah maksud.
- Keluarkan JSON sah sahaja dengan bentuk:
{"agenda":"teks agenda berbaris baharu","closing":"teks penutup atau string kosong","title":"tajuk dokumen atau string kosong","fields":{"day":"","date":"","time":"","venue":"","chair":"","attendance":"","attendOther":"","bil":"","secretary":"","prepared":""}}
- Jangan sertakan markdown fence atau penerangan di luar JSON.
`;

function jsonResponse(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return jsonResponse(res, 405, { error: "Method not allowed" });
  const { provider, documentType, fields = {}, rawNotes = "", existingAgenda = "", instructions = "" } = req.body || {};
  if (!["gemini", "openai"].includes(provider)) return jsonResponse(res, 400, { error: "Pilih Gemini atau ChatGPT." });
  const source = String(rawNotes).slice(0, 60000);
  const agenda = String(existingAgenda).slice(0, 30000);
  if (!source.trim() && !agenda.trim()) return jsonResponse(res, 400, { error: "Masukkan nota atau agenda terlebih dahulu." });

  const input = `
Jenis dokumen: ${documentType === "curai" ? "Minit Curai" : "Minit Mesyuarat"}
Maklumat borang sedia ada (jangan meneka nilai kosong):
${JSON.stringify(fields, null, 2)}

Nota asal yang dibekalkan pengguna:
${source || "(Tiada nota asal dibekalkan)"}

Agenda / teks minit sedia ada:
${agenda || "(Tiada agenda sedia ada)"}

Arahan tambahan pengguna:
${String(instructions).slice(0, 4000) || "(Tiada)"}

Susun nota untuk minit rasmi. Kekalkan fakta dan hasilkan JSON mengikut skema dalam arahan sistem.
`;
  try {
    let output = "";
    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) return jsonResponse(res, 503, { error: "OPENAI_API_KEY belum ditetapkan dalam Environment Variables." });
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: SYSTEM_PROMPT,
          input,
          text: { format: { type: "json_object" } },
          max_output_tokens: 5000
        })
      });
      const data = await response.json();
      if (!response.ok) return jsonResponse(res, response.status, { error: data.error?.message || "OpenAI API request failed." });
      output = data.output_text || (data.output || []).flatMap(item => item.content || []).map(c => c.text || "").join("\n");
    } else {
      if (!process.env.GEMINI_API_KEY) return jsonResponse(res, 503, { error: "GEMINI_API_KEY belum ditetapkan dalam Environment Variables." });
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 5000 }
        })
      });
      const data = await response.json();
      if (!response.ok) return jsonResponse(res, response.status, { error: data.error?.message || "Gemini API request failed." });
      output = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n");
    }

    let parsed;
    try {
      const clean = output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return jsonResponse(res, 502, { error: "AI tidak memulangkan JSON yang sah. Cuba sekali lagi atau pendekkan nota." });
    }
    if (typeof parsed.agenda !== "string") return jsonResponse(res, 502, { error: "Respons AI tidak mempunyai medan agenda yang sah." });
    return jsonResponse(res, 200, {
      agenda: parsed.agenda,
      closing: typeof parsed.closing === "string" ? parsed.closing : "",
      title: typeof parsed.title === "string" ? parsed.title : "",
      fields: parsed.fields && typeof parsed.fields === "object" ? parsed.fields : {}
    });
  } catch (err) {
    return jsonResponse(res, 500, { error: "Ralat backend ketika memanggil AI. Sila cuba lagi." });
  }
};
