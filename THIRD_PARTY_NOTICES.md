# Third-party notices

Job Acquisition OS (MIT, © 2026 Akash Sync Agent) reuses or adapts the following permissively licensed open-source work. Only MIT, Apache-2.0, BSD and ISC licences are used. No GPL, AGPL or unlicensed code is included. The original copyright and licence text of each project is reproduced below.

| Project | What is reused | Author | Licence | Link |
|---|---|---|---|---|
| JSON Resume schema | The resume data shape (basics, work, education, skills, projects, certificates, languages and their field names) used for the tailored resume (`src/lib/resumeDoc.ts`, `server/handlers.ts`) | JSON Resume | MIT | https://github.com/jsonresume/resume-schema |
| RenderCV | ATS layout rules and the look of its "classic", "sb2nov" and "engineeringresumes" themes adapted (not code) into the Classic, Editorial and Compact templates (`src/lib/resumeDoc.ts`, `src/lib/resumeStyle.ts`): one column, standard section headings, dates on the right, real selectable text, no tables or images | Sina Atalay and contributors | MIT | https://github.com/rendercv/rendercv |
| jsonresume-theme-even | Section order and heading/rule styling adapted for the PDF/DOCX/preview renderer, not code | Rafael Bardini | MIT | https://github.com/rbardini/jsonresume-theme-even |
| form-to-google-sheets | Apps Script pattern adapted for `scripts/apps-script/Code.gs`: doPost with LockService, appendRow to a Sheet, MailApp email on each new entry (modified: JSON body, shared secret, comments tab, moderation, replies) | Jamie Wilson | Apache-2.0 | https://github.com/jamiewilson/form-to-google-sheets |
| FreeHire | Public job search API (called, not copied) | strelov1 | MIT | https://github.com/strelov1/freehire |
| jsPDF | PDF export (npm dependency) | James Hall and contributors | MIT | https://github.com/parallax/jsPDF |
| docx | DOCX export (npm dependency) | Dolan Miu | MIT | https://github.com/dolanmiu/docx |
| JobSpy | Work-mode rules adapted, not code (`src/lib/eligibility.ts`): a posting tagged remote and hybrid is hybrid; "Hybrid - City" location labels; schema.org TELECOMMUTE also covers hybrid, so a remote flag alone is not trusted | Cullen Watson | MIT | https://github.com/speedyapply/JobSpy |
| work-in-timezone | Idea of parsing "+05:30" offsets to hours and treating time-zone eligibility as an overlap of offset ranges (`offsetToHours` in `src/lib/eligibility.ts`, rewritten) | Michal Kvasničák | MIT | https://github.com/michalkvasnicak/work-in-timezone |
| Himalayas Jobs API | Remote job data (locationRestrictions, timezoneRestrictions). Shown with a visible source name and link to the Himalayas job page; not passed on to other job boards (himalayas.app/terms#api) | Himalayas | API terms (data, not code) | https://himalayas.app/api |
| Remote OK API | Remote job data, cached 6 hours. Every job links to its Remote OK page and names Remote OK as the source, as its API terms require | Remote OK | API terms (data, not code) | https://remoteok.com/api |
| awesome-llm-apps | Ideas adapted, not code: the resume_job_matcher scoring (skills, experience and keyword-gap breakdown, `src/lib/matchScore.ts`, `server/handlers.ts` match-score) and the ai-dashboard-canvas-agent dashboard style (KPI cards and simple charts, `src/admin/AdminApp.tsx`) | Shubham Saboo and contributors | Apache-2.0 | https://github.com/Shubhamsaboo/awesome-llm-apps |

Projects that were reviewed and **not** used: giscus (MIT; every commenter must log in with GitHub, and team replies would show a GitHub username, not "Akash Sync Agent team"), remark42 (MIT; needs its own always-on server), dwyl/learn-to-send-email-via-google-script-html-no-server (GPL-2.0, excluded by licence), Reactive Resume (MIT, a full app; nothing copied), OpenResume (AGPL-3.0, excluded by licence), Awesome-CV (LPPL, LaTeX, excluded).

---

## JSON Resume schema: licence
```
The MIT License (MIT)

Copyright &copy; 2024 JSON Resume

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## RenderCV: licence
```
MIT License

Copyright (c) 2023 to present Sina Atalay and individual contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## jsonresume-theme-even: licence
```
MIT License

Copyright (c) 2018 Rafael Bardini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## form-to-google-sheets: licence (Apache License 2.0)
Modified by Akash Sync Agent in 2026 (see the header of `scripts/apps-script/Code.gs`). The upstream repository has no NOTICE file.
```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright {yyyy} {name of copyright owner}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

```


## JobSpy: licence
MIT License

Copyright (c) 2023 Cullen Watson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## work-in-timezone: licence
Copyright 2019 Michal Kvasničák (https://github.com/michalkvasnicak)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Ideas used (no code copied)
| Project | Licence | What we took |
|---|---|---|
| [JobSync](https://github.com/Gsync/jobsync) (Gsync) | MIT | The idea of an application tracker with stages, per-stage dates, tasks/next actions and an interview question bank. Our code is our own. |
| [JobHunter](https://github.com/aashishbharti04/jobhunter) (aashishbharti04) | MIT | The idea of follow-up reminder dates flagged as overdue / due today on a pipeline dashboard. Our code is our own. |

## Admin charts
| Package | Licence | Use |
|---|---|---|
| [Recharts](https://github.com/recharts/recharts) 2.x (Recharts Group) | MIT | Charts on the owner-only /admin page (lazy-loaded; not downloaded by the public site). Its dependencies are MIT, ISC (d3 modules) and BSD-3-Clause; full texts ship in node_modules and the bundled licence comments. |

## Server libraries
| Package | Licence | Use |
|---|---|---|
| [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) (Google LLC) | Apache-2.0 | Verifies Google ID tokens on the server (audience, issuer, expiry). Licence text: https://www.apache.org/licenses/LICENSE-2.0 |
| [@google/genai](https://github.com/googleapis/js-genai) (Google LLC) | Apache-2.0 | Gemini API client |

## Merged first-party code
| Source | Licence | Use |
|---|---|---|
| [Automatically-map-your-LinkedIn-footprint-](https://github.com/advakash2356-sys/Automatically-map-your-LinkedIn-footprint-) and [Autonomous-Job-Outreach-Agent-Platform](https://github.com/advakash2356-sys/Autonomous-Job-Outreach-Agent-Platform), Copyright (c) 2026 Akash Sharma | MIT | Profile match idea (resume vs profile consistency and contact checks), rebuilt to run on user-provided data only. |


## awesome-llm-apps: licence
```
Copyright Shubham Saboo and contributors.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

Changes: ideas only were adapted and rewritten in TypeScript for Job Acquisition OS.
```

## free-email-domains (MIT)
`src/lib/freeMailDomains.ts` holds a 61-domain subset of https://github.com/Kikobeats/free-email-domains, used by Scam Shield to spot free email addresses.

```
The MIT License (MIT)

Copyright © 2017 Kiko Beats <josefrancisco.verdu@gmail.com> (kikobeats.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

Scam Shield rules, Job Truth Score, Ghost-Proof Follow-up and the autofill extension are original code. GitHub was searched for MIT/Apache/BSD/ISC scam-pattern lists and autofill extensions; nothing suitable was found (the matches were unlicensed or tiny), so none was copied.

## natural: Porter stemmer (MIT)
`src/lib/porter.ts` is a TypeScript port of `lib/natural/stemmers/porter_stemmer.js` from https://github.com/NaturalNode/natural. Logic unchanged.

```
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## tesseract.js and tesseract.js-core (Apache-2.0)
OCR for scanned offer letters (Offer Shield). npm dependency `tesseract.js`; at build, `scripts/copy-ocr.mjs` copies `worker.min.js` and the LSTM WASM core into `dist/ocr/`, unmodified. Copyright the tesseract.js authors, https://github.com/naptha/tesseract.js. Licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). The English language data is self-hosted (see below).

## Resume-Matcher (Apache-2.0): idea only
`src/lib/fitScore.ts` follows the idea in https://github.com/srbhr/Resume-Matcher of blending keyword coverage with whole-text similarity. Rewritten in TypeScript; no code copied. Copyright the Resume-Matcher contributors, Apache License 2.0.

## OpenJobAutofill (MIT): approach only
`extension/fieldmap.js` and `extension/content.js` use the per-portal site-adapter and select-option matching approach of https://github.com/Br1an67/OpenJobAutofill. Rewritten; no code copied. Copyright (c) 2026 Br1an67, MIT License.

pdf.js (Apache-2.0) and mammoth.js (BSD-2-Clause) are existing dependencies, used unmodified to read offer letters.

## Tesseract English language data (Apache-2.0)
`dist/ocr/lang/eng.traineddata.gz` is copied at build, unmodified, from the npm package `@tesseract.js-data/eng` (4.0.0_best_int; package licence MIT). The data itself comes from https://github.com/tesseract-ocr/tessdata_best, licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). Copyright the Tesseract OCR authors. It is now served from this site; nothing is downloaded from jsDelivr.
