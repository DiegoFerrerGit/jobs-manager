import re

with open("src/app/login/LoginClient.tsx", "r") as f:
    lines = f.readlines()

# The CV mockup is from line 536 to 582
# Wait, let's find the exact indices
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* CV MOCKUP */}" in line:
        start_idx = i
        break

if start_idx != -1:
    for i in range(start_idx + 1, len(lines)):
        if "</motion.div>" in lines[i]:
            end_idx = i
            break

if start_idx == -1 or end_idx == -1:
    print(f"Could not find markers. start: {start_idx}, end: {end_idx}")
    exit(1)

new_cv_mockup = """                  {/* CV MOCKUP */}
                  {activeIndex === 2 && (
                    <div style={{ width: '100%', height: 440, background: '#121215', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}>

                      {/* Editor chrome bar */}
                      <div style={{ height: 38, background: '#0C1210', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                        <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#8A9A92', marginLeft: 8 }}>cv.typ</span>
                        <span style={{ marginLeft: 'auto', background: 'rgba(0,201,122,0.14)', color: '#34D399', fontSize: 10, padding: '3px 10px', borderRadius: 6 }}>PDF actualizado</span>
                      </div>

                      {/* Two-panel body */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', flex: 1, minHeight: 0 }}>

                        {/* Left: code with line numbers */}
                        <div style={{ background: '#0C1210', padding: '16px 0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          {[
                            { n: 1,  code: <><span style={{color:'#C792EA'}}>#let</span> <span style={{color:'#C7D2CC'}}>cv(name, title, body) = {'{'}</span></> },
                            { n: 2,  code: <><span style={{color:'#82AAFF'}}>  set</span> <span style={{color:'#82AAFF'}}>text</span><span style={{color:'#C7D2CC'}}>(font: </span><span style={{color:'#C3E88D'}}>"Inter"</span><span style={{color:'#C7D2CC'}}>, size: 10pt)</span></> },
                            { n: 3,  code: <><span style={{color:'#82AAFF'}}>  align</span><span style={{color:'#C7D2CC'}}>(center)[</span></> },
                            { n: 4,  code: <><span style={{color:'#C792EA'}}>    #text</span><span style={{color:'#C7D2CC'}}>(17pt, weight: 700)[</span><span style={{color:'#C792EA'}}>#name</span><span style={{color:'#C7D2CC'}}>]</span></> },
                            { n: 5,  code: <><span style={{color:'#C792EA'}}>    #v</span><span style={{color:'#C7D2CC'}}>(2pt)</span></> },
                            { n: 6,  code: <><span style={{color:'#C792EA'}}>    #text</span><span style={{color:'#C7D2CC'}}>(9pt, fill: gray)[</span><span style={{color:'#C792EA'}}>#title</span><span style={{color:'#C7D2CC'}}>]</span></> },
                            { n: 7,  code: <><span style={{color:'#C7D2CC'}}>  ]</span></> },
                            { n: 8,  code: <><span style={{color:'#82AAFF'}}>  line</span><span style={{color:'#C7D2CC'}}>(length: 100%)</span></> },
                            { n: 9,  code: <><span style={{color:'#C7D2CC'}}>  body</span></> },
                            { n: 10, code: <><span style={{color:'#C7D2CC'}}>{'}'}</span></> },
                            { n: 11, code: null },
                            { n: 12, code: <><span style={{color:'#F97316'}}>=</span> <span style={{color:'#C7D2CC'}}>Experience</span></> },
                            { n: 13, code: null },
                            { n: 14, code: <><span style={{color:'#FB923C'}}>{`== Engineering Manager`}</span></> },
                            { n: 15, code: <><span style={{color:'#7E8B84', fontStyle:'italic'}}>_Stripe (2022 - Present)_</span></> },
                            { n: 16, code: <><span style={{color:'#C7D2CC'}}>- Led a team of 15 engineers</span></> },
                            { n: 17, code: <><span style={{color:'#C7D2CC'}}>- Architected the ledger system</span></> },
                            { n: 18, code: <><span style={{color:'#C7D2CC'}}>- Improved team velocity by 40%</span></> },
                            { n: 19, code: null },
                            { n: 20, code: <><span style={{color:'#FB923C'}}>{`== Senior Frontend Engineer`}</span></> },
                            { n: 21, code: <><span style={{color:'#7E8B84', fontStyle:'italic'}}>_Coinbase (2019 - 2022)_</span></> },
                            { n: 22, code: <><span style={{color:'#C7D2CC'}}>- Rebuilt the trading dashboard</span></> },
                          ].map(({ n, code }) => (
                            <div key={n} style={{ display: 'flex', lineHeight: '18px', flexShrink: 0 }}>
                              <span style={{ width: 30, textAlign: 'right', paddingRight: 10, color: '#3F4C46', fontSize: 10.5, fontFamily: 'monospace', flexShrink: 0 }}>{n}</span>
                              <span style={{ fontFamily: 'monospace', fontSize: 10.5, whiteSpace: 'pre', color: '#C7D2CC' }}>{code ?? '\\u00a0'}</span>
                            </div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div style={{ background: 'rgba(255,255,255,0.08)' }}></div>

                        {/* Right: A4 sheet */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'transparent' }}>
                          <div style={{ height: 370, width: 262, background: '#FFFFFF', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', padding: '22px 24px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                            {/* Name */}
                            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: '#111', marginBottom: 3 }}>ALEX MORGAN</div>
                            <div style={{ textAlign: 'center', fontSize: 6.5, color: '#666', marginBottom: 10 }}>Engineering Manager · Buenos Aires · alex@mail.com</div>
                            <div style={{ height: 1.5, background: '#111', marginBottom: 12 }}></div>

                            {/* Experience */}
                            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>EXPERIENCE</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Engineering Manager, Stripe</span>
                              <span style={{ fontSize: 6.5, color: '#666' }}>2022 – Present</span>
                            </div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '92%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '68%' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Senior Frontend, Coinbase</span>
                              <span style={{ fontSize: 6.5, color: '#666' }}>2019 – 2022</span>
                            </div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '86%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '61%' }}></div>

                            {/* Skills */}
                            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>SKILLS</div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '74%' }}></div>

                            {/* Education */}
                            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>EDUCATION</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Ing. en Sistemas, UBA</span>
                              <span style={{ fontSize: 6.5, color: '#666' }}>2014 – 2019</span>
                            </div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '88%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '62%' }}></div>

                            {/* Languages */}
                            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>LANGUAGES</div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '72%' }}></div>
                            <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 0, width: '48%' }}></div>

                          </div>
                        </div>

                      </div>
                    </div>
                  )}
"""

lines = lines[:start_idx] + [new_cv_mockup + "\n"] + lines[end_idx:]

with open("src/app/login/LoginClient.tsx", "w") as f:
    f.writelines(lines)

print(f"Replaced {start_idx} to {end_idx}")
