# Registr zbytkových rizik – <projekt>

Riziko = dopad (1–5) × pravděpodobnost (1–5). ≥ 15 nepřijatelné bez schválení klientem.

| ID | Riziko | Dopad | Pravd. | Skóre | Opatření (stávající) | Plánované opatření | Vlastník | Termín revize | Akceptoval (kdo, kdy) |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Signed URL nelze odvolat před expirací | 2 | 2 | 4 | expirace 120 s | – | | | |
| R-02 | Cookies Supabase relace nejsou HttpOnly (XSS → krádež relace) | 4 | 2 | 8 | přísná CSP s nonce, žádné 3rd-party skripty | | | | |
| R-03 | Kompromitace Supabase účtu organizace | 5 | 1 | 5 | MFA, min. členů, offsite zálohy s Object Lock | | | | |
