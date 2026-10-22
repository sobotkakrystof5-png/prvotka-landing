# Matice oprávnění – <projekt>

Výchozí stav každé buňky: **✘ zakázáno**. Povoluje se výslovně. Kontrola se implementuje
dvakrát: v DAL (`authorize()`) a v DB (RLS). Každý řádek má mít negativní test.

Legenda: ✔ povoleno · ✘ zakázáno · 🔒 povoleno s re-autentizací / MFA AAL2 · 👥 vyžaduje druhé schválení · ⓞ jen vlastní záznamy

| Operace | anon | viewer | user | manager | owner | platform_admin |
|---|---|---|---|---|---|---|
| org.read | ✘ | ✔ | ✔ | ✔ | ✔ | ✘ (jen impersonace s auditem) |
| contact.read | ✘ | ✔ | ✔ | ✔ | ✔ | ✘ |
| contact.create/update | ✘ | ✘ | ✔ | ✔ | ✔ | ✘ |
| contact.delete | ✘ | ✘ | ⓞ | ✔ | ✔ | ✘ |
| invoice.read | ✘ | ✔ | ✔ | ✔ | ✔ | ✘ |
| invoice.create | ✘ | ✘ | ✔ | ✔ | ✔ | ✘ |
| invoice.void | ✘ | ✘ | ✘ | 🔒 | 🔒 | ✘ |
| invoice.field.bank_account | ✘ | ✘ | ✘ | ✘ | 🔒👥 | ✘ |
| member.invite | ✘ | ✘ | ✘ | ✔ (max. role user) | ✔ | ✘ |
| member.change_role | ✘ | ✘ | ✘ | ✘ | 🔒 (ne sám sobě) | ✘ |
| org.export_all | ✘ | ✘ | ✘ | ✘ | 🔒 + limit + audit | ✘ |
| billing.manage | ✘ | ✘ | ✘ | ✘ | 🔒 | ✘ |
| audit_log.read | ✘ | ✘ | ✘ | ✘ | ✔ | ✔ (jen metadata) |

## Citlivá pole (field-level)
| Pole | Čtení | Zápis | Poznámka |
|---|---|---|---|
| memberships.role | člen firmy | jen owner přes RPC | nikdy přímý UPDATE |
| invoices.org_id | – | nikdy po vytvoření | trigger neměnnosti |
| invoices.status=paid | – | jen webhook/server | klient nesmí |

## Pravidla pro role
- Nikdo nesmí udělit roli vyšší, než sám má.
- Poslední owner firmy nesmí být odebrán/degradován.
- Změna role → zneplatnění relací dotčeného uživatele nebo krátké okno (viz #33).
