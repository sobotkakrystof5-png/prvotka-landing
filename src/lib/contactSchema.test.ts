import { describe, expect, it } from "vitest";
import { contactSchema } from "./contactSchema";
import { escapeHtml, toSingleLine } from "./escapeHtml";

const valid = {
  name: "Jana Ukázková",
  company: "Ukázková kancelář",
  email: "jana@example.com",
  phone: "777 123 456",
  invoiceVolume: "200-600",
  program: "POHODA",
  programOther: "",
  message: "",
  startedAt: 1,
};

describe("contactSchema", () => {
  it("přijme platná data", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("ořízne mezery kolem e-mailu", () => {
    const parsed = contactSchema.parse({ ...valid, email: "  jana@example.com " });
    expect(parsed.email).toBe("jana@example.com");
  });

  it("odmítne příliš dlouhou zprávu", () => {
    expect(contactSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(false);
  });

  it("vyžaduje název programu při volbě Jiný", () => {
    const result = contactSchema.safeParse({ ...valid, program: "Jiný", programOther: "" });
    expect(result.success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, program: "Jiný", programOther: "Helios" }).success).toBe(true);
  });

  it("přijme české i mezinárodní telefonní číslo", () => {
    for (const phone of ["777 123 456", "+420 777 123 456", "+44 20 7946 0958"]) {
      expect(contactSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it("odmítne nesmyslný telefon", () => {
    for (const phone of ["123", "abc 123 456 789", "+420 777 123 456 789 123 4"]) {
      expect(contactSchema.safeParse({ ...valid, phone }).success).toBe(false);
    }
  });

  it("vyžaduje telefon", () => {
    for (const phone of ["", "   "]) {
      expect(contactSchema.safeParse({ ...valid, phone }).success).toBe(false);
    }
  });

  it("odmítne hodnotu mimo nabídku čipů", () => {
    expect(contactSchema.safeParse({ ...valid, invoiceVolume: "milion" }).success).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapuje znaky HTML", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });
});

describe("toSingleLine", () => {
  it("odstraní konce řádků (ochrana předmětu e-mailu)", () => {
    expect(toSingleLine("Firma\r\nBcc: x@y.cz")).toBe("Firma Bcc: x@y.cz");
  });
});
