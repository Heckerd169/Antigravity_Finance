import re

t = open("V2/v2_roadmap_konsolidiert.md", encoding="utf-8").read()


def zeilen(block):
    return [
        l
        for l in block.split("\n")
        if l.startswith("|")
        and not l.startswith("|---")
        and not l.startswith("| # | Punkt")
    ]


pakete_teil = t.split("## 1. Offene Pakete")[1].split("## 2. Hausaufgaben")[0]
alle = zeilen(pakete_teil)
ok = sum(1 for l in alle if "| ✅ |" in l)
print(f"Paket-Tabellen: {len(alle)} Zeilen, davon {ok} ✅ → {len(alle)-ok} offen")

pakete = re.split(r"^### Paket ", pakete_teil, flags=re.M)[1:]
voll = offen = 0
for p in pakete:
    z = zeilen(p)
    if not z:
        continue
    e = sum(1 for l in z if "| ✅ |" in l)
    if e == len(z):
        voll += 1
    else:
        offen += 1
print(f"Pakete mit Tabelle: {voll+offen}, davon vollständig: {voll}, offen: {offen}")

ha = zeilen(t.split("## 2. Hausaufgaben")[1].split("## 3.")[0])
print(f"Hausaufgaben: {len(ha)}, davon ⬜: {sum(1 for l in ha if '| ⬜ |' in l)}")

dn = zeilen(t.split("## 3. Dauerhaft nicht")[1].split("## 4.")[0])
print(f"Dauerhaft nicht: {len(dn)}")

er = zeilen(t.split("## 4. Erledigt")[1].split("## 5.")[0])
print(f"Erledigt (§4): {len(er)}")
