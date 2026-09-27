<img width="1500" height="375" alt="image" src="https://github.com/user-attachments/assets/3349069b-8511-49ea-9703-590e523abbec" />

<p align="center">A <strong>perfect wrapper</strong> for interacting with <strong>PRONOTE Campus instances.</strong></p>
<p align="center">
  <img src="https://img.shields.io/npm/v/blockshub@blockscampus?color=cb3837" alt="Blocksnote Logo" />
  <img src="https://img.shields.io/badge/PRONOTE_Campus-2026.4.7-fb434f" alt="Blockscampus Logo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="language"></img>
</p>

> [!IMPORTANT]
> This project is currently in development.

## Compatibility
This wrapper supports the following PRONOTE Campus workspaces:

| Workspace | Authenticator | Features |
|---|---|---|
| Espace Étudiants | `StudentAuthenticator` | everything listed below |
| Espace Parents | `ParentAuthenticator` | same as students, on behalf of the selected child (`selectMember`) |
| Espace Entreprise | `CompanyAuthenticator` | same as students, on behalf of the selected intern / work-study student |
| Espace Enseignants | `TeacherAuthenticator` | timetable only |

The features actually available depend on the tabs enabled by the school: `user.tabs` / `user.hasTab()` tell what the server allows.
The *secrétariat* and *appariteur* workspaces are detected but not supported.

Also, for security reasons, actions regarding the account security (eg. changing password, PIN code, authentication methods, etc.) will **never** be supported by this wrapper. If you wish to change your account security, please use the official PRONOTE Campus website or mobile application.

## Roadmap
Here's the features that are available and planned:
- [ ] Login to PRONOTE Campus instances
    - [x] Vanilla Login (username + password)
    - [ ] PIN Code verification
    - [ ] SSO Login
    - [ ] Token Refresh and Login (like the mobile app)
- [x] Timetable (`timetable()`) — lessons, canceled lessons, make-up lessons, videoconferences
- [x] Grades
    - [x] Fetch grades (`grades()`) and grading periods (`periods()`)
    - [x] Grades transcript (`transcript()`)
    - [x] Grades report (`reportCard()`) — appreciations are not verified yet (not published on the demo)
- [x] School life
    - [x] Absences and lateness (`absences()`)
    - [x] Schooling (`schooling()`), follow-ups (`followUps()`), school calendar (`calendar()`)
- [x] Lessons
    - [x] Lessons content (`programme()`)
    - [x] Homework (`homework()`)
    - [x] Pedagogical resources (`resources()`) and supervised exams (`supervisedExams()`)
- [x] Internships: internships (`internships()`, `internship()`) and companies (`companies()`)
- [x] Informations and Surveys (`news()`, `notifications()`) — read only, not verified yet (no news on the demo)
- [x] Account information (`account()`, `documents()`)

This roadmap will be updated as new features are added or planned.

## Usage
```ts
import { Instance, StudentAuthenticator } from "@blockshub/blockscampus";

const instance = await Instance.createFromURL("https://hpdemofr.hyperplanning.fr/hp/");
const authenticator = new StudentAuthenticator(instance);
await authenticator.credentials("AUDIBERT", "demodemo");
const student = await authenticator.finalize();

const timetable = await student.timetable({ from: new Date(2026, 8, 21), to: new Date(2026, 8, 28) });
const grades = await student.grades();
const homework = await student.homework();
```

See the [`exemples`](/exemples) folder, and `bun scripts/smoke.ts` to run every feature against the demo instance.

## Differences with PRONOTE
PRONOTE Campus (formerly HYPERPLANNING) shares the transport of PRONOTE (`appelfonction/<espace>/<session>/<AES(n°)>`, `dataSec` with `Signature` + `data`, AES key exchange), but:

- **No `InfoMobileApp.json`**: workspaces are discovered by probing `<url>/<espace>?fd=1` (`etudiant`, `parent`, `entreprise`, `enseignant`, `secretariat`, `appariteur`).
- **Bootstrap**: the page calls `Start ({"a": <genreEspace>, "i": <session>, ...})`; the session id is `i` (not `h`). The demo does not compress nor encrypt `dataSec`.
- **Authentication**: `FonctionParametres` → `Identification` → `Authentification`. The challenge is **encrypted as is** with `login + SHA256(alea + password)` (no decrypt/decode step). The answer already contains the user (`Utilisateur`, with `listeMembres` for parents and companies).
- **`DemandeParametreUtilisateur`** replaces `ParametresUtilisateur` and **must be called right after the authentication**: until then every function answers "Vos droits sont insuffisants".
- **Signature**: `{ Onglet: "COURS.EDT.EDT_LISTE", membre?, listeRecherche: [user or member] }` — tabs are dotted strings (see `Tab`).
- **Functions**: `FonctionEmploiDuTemps`, `Progressions`, `PeriodeNotation`, `PageDernieresNotes`, `PageReleveDeNotes`, `PageBulletin`, `PageReleveAbsence`, `PageScolarite`, `ListeSuivisEtudiant`, `CalendrierScolaire`, `ListeRessourcesPeda`, `DevoirsSurveilles`, `ListeStages`, `FicheStage`, `ListeOffresStages`, `PageInfoSondage`, `CentraleNotifications`, `Compte`, `DocumentsATelecharger`.
- **No dates in courses**: a course is `{ G: week, p: place, d: duration }`. The date is `PremierLundi + (G - 1) weeks + JoursOuvres[p / PlacesParJour]`, the hours come from `Horaire.ListeHeures` (see `Schedule`). Absences use the same encoding (`SD/PD`, `SF/PF`).
- **Files**: `FichiersExternes/<AES(JSON({ N, G? }))>/<name>?Session=<id>`.

### Reverse-engineering tools
- `bun scripts/capture.ts <etudiant|parent|entreprise|enseignant>` logs into the demo (credentials read from `../identifiants.pronote-campus.txt`) and dumps every answer into `fixtures/<space>/`.
- `bun scripts/probe.ts <space> <user> <password> [calls.json]` calls arbitrary functions.
- `bun test` runs offline tests on the fixtures.

## Installation
[Bun](https://bun.sh) is recommended for its faster startup time, built-in TypeScript support, and improved performance when handling cryptographic operations and data compression, while remaining fully compatible with Node.js.

### With npm
```bash
npm install @blockshub/blockscampus
```

### With Bun (recommended)
```bash
bun add @blockshub/blockscampus
```

## Documentation
A comprehensive documentation will be available soon.

## Contributing
Please see [CONTRIBUTING](/CONTRIBUTING.md) in the repository for guidelines and best practices.

## License
Blocksnote is licensed under the [MIT License](https://choosealicense.com/licenses/mit/), allowing you to use, modify, and distribute it for both commercial and non-commercial purposes, provided that the license terms are respected. See the [LICENSE](/LICENSE) file for more details.

## Legalities
This project is meant to help users interact with their own data while respecting French software laws ([Article L.122-6-1 of the French Intellectual Property Code](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044365559)). It only does what’s needed to make the software work together with other tools, without copying, sharing, or changing the original software. This analysis is limited to what’s needed for interoperability and isn’t used for anything else.

This wrapper is not affiliated with or endorsed by the PRONOTE Campus developers. It is an independent project created by the community to provide additional functionality and convenience for users of PRONOTE Campus. Therefore, users must using this at their own risk, and the developers of this wrapper cannot be held responsible for any issues that may arise from its use.

For any legal questions or concerns regarding this project, contact: [raphael@papillon.bzh](mailto:raphael@papillon.bzh?subject=%5BBlocksHub%5D%20Legal%20Inquiry%20about%20Blocksnote).

## Credits
- [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) - [MIT License](https://choosealicense.com/licenses/mit/)
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - [MIT License](https://choosealicense.com/licenses/mit/)
- [micro-rsa-dsa-dh](https://github.com/paulmillr/micro-rsa-dsa-dh) - [MIT License](https://choosealicense.com/licenses/mit/)
