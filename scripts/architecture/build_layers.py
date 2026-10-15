"""Gera as 5 camadas arquitetônicas do hero.

Saída:
  public/hero/camada-01-gestao.svg ... camada-05-automacao.svg  (arquivos independentes)
  src/components/hero/layers.generated.ts  (mesmas camadas como marcação inline,
                                            âncoras dos pontos e níveis)
Uso: python3 scripts/architecture/build_layers.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from iso import P, pts, FOOT, GRID_X, GRID_Y, LEVELS, GAP, U, OX, OY

ROOT = os.path.join(os.path.dirname(__file__), "../..")
X0, X1, Y0, Y1 = FOOT["x0"], FOOT["x1"], FOOT["y0"], FOOT["y1"]

STYLE = """
.aq-e{stroke:rgba(255,255,255,.10);stroke-width:.8;stroke-linejoin:round}
.aq-plan{stroke:rgba(245,245,242,.15);stroke-width:.7;fill:none}
.aq-gold{stroke:rgba(215,168,62,.72);stroke-width:1;stroke-linecap:round;fill:none}
.aq-dash{stroke:rgba(215,168,62,.26);stroke-width:.7;stroke-dasharray:3 4;fill:none}
.aq-seam{stroke:rgba(215,168,62,.55);stroke-width:.9;fill:none}
.aq-mull{stroke:rgba(230,236,242,.22);stroke-width:.6;fill:none}
"""


class Layer:
    def __init__(self, lid):
        self.lid = lid
        self.items = []  # (ordem, svg)

    def g(self, name):
        return f"url(#{self.lid}-{name})"

    def add(self, key, svg):
        self.items.append((key, svg))

    def box(self, x0, x1, y0, y1, za, zb, top="top", right="right", front="front", key=None):
        t = pts(P(x0, y0, zb), P(x1, y0, zb), P(x1, y1, zb), P(x0, y1, zb))
        r = pts(P(x1, y0, zb), P(x1, y1, zb), P(x1, y1, za), P(x1, y0, za))
        f = pts(P(x0, y1, zb), P(x1, y1, zb), P(x1, y1, za), P(x0, y1, za))
        k = key if key is not None else ((x0 + x1) / 2 + (y0 + y1) / 2, za)
        fill = lambda m: m if m.startswith(("rgba", "#", "none")) else self.g(m)
        self.add(k, f'<polygon class="aq-e" points="{f}" fill="{fill(front)}"/>'
                    f'<polygon class="aq-e" points="{r}" fill="{fill(right)}"/>'
                    f'<polygon class="aq-e" points="{t}" fill="{fill(top)}"/>')

    def poly(self, key, cls, *p, fill="none"):
        self.add(key, f'<polygon class="{cls}" points="{pts(*p)}" fill="{fill}"/>')

    def line(self, key, cls, a, b):
        self.add(key, f'<line class="{cls}" x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')

    def seam(self, z, inset=0.2):
        """Contorno dourado na base da camada: some quando tudo se encaixa."""
        a, b, c, d = X0 + inset, X1 - inset, Y0 + inset, Y1 - inset
        self.add((-99, z), f'<polyline class="aq-seam" points="{pts(P(a, d, z), P(b, d, z), P(b, c, z))}"/>')

    def defs(self):
        L = self.lid
        return f"""<defs>
<linearGradient id="{L}-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#45464c"/><stop offset="1" stop-color="#35363b"/></linearGradient>
<linearGradient id="{L}-slab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3c41"/><stop offset="1" stop-color="#2c2d31"/></linearGradient>
<linearGradient id="{L}-right" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25262a"/><stop offset="1" stop-color="#18191c"/></linearGradient>
<linearGradient id="{L}-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#303136"/><stop offset="1" stop-color="#222327"/></linearGradient>
<linearGradient id="{L}-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c6e74"/><stop offset="1" stop-color="#47494e"/></linearGradient>
<linearGradient id="{L}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(150,170,190,.30)"/><stop offset=".55" stop-color="rgba(90,105,120,.16)"/><stop offset="1" stop-color="rgba(60,70,82,.24)"/></linearGradient>
<linearGradient id="{L}-glassr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(70,82,96,.34)"/><stop offset="1" stop-color="rgba(40,48,58,.30)"/></linearGradient>
<linearGradient id="{L}-cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfa650"/><stop offset="1" stop-color="#8f6b22"/></linearGradient>
<filter id="{L}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
</defs>"""

    def markup(self):
        body = "".join(s for _, s in sorted(self.items, key=lambda it: it[0]))
        return self.defs() + body


def facade_front(L, x0, x1, za, zb, y, n, cls="aq-mull"):
    for i in range(1, n):
        x = x0 + (x1 - x0) * i / n
        L.line((99, za), cls, P(x, y, za), P(x, y, zb))


def facade_right(L, y0, y1, za, zb, x, n, cls="aq-mull"):
    for i in range(1, n):
        y = y0 + (y1 - y0) * i / n
        L.line((99, za), cls, P(x, y, za), P(x, y, zb))


layers = {}

# ---------- 01 · GESTÃO — o alicerce ----------
z0, z1 = LEVELS[0][1], LEVELS[0][2]
L = Layer("gestao")
L.add((-200, 0), f'<polygon points="{pts(P(X0 - .4, Y0 + .6, 0), P(X1 + 1, Y0 + .6, 0), P(X1 + 1, Y1 + 1.2, 0), P(X0 - .4, Y1 + 1.2, 0))}" fill="rgba(0,0,0,.55)" filter="url(#gestao-soft)"/>')
for gx in GRID_X:
    L.line((-150, 0), "aq-dash", P(gx, Y1, 0), P(gx, Y1 + 1.6, 0))
for gy in GRID_Y:
    L.line((-150, 0), "aq-dash", P(X1, gy, 0), P(X1 + 1.6, gy, 0))
PL, SL, IN = 0.55, 0.9, 0.35
L.box(X0, X1, Y0, Y1, z0, PL, key=(-100, 0))
L.line((-99, 1), "aq-gold", P(X0, Y1, PL), P(X1, Y1, PL))
L.line((-99, 1), "aq-gold", P(X1, Y1, PL), P(X1, Y0, PL))
L.box(X0 + IN, X1 - IN, Y0 + IN, Y1 - IN, PL, SL, top="slab", key=(-98, 0))
xi0, xi1, yi0, yi1 = X0 + IN + .3, X1 - IN - .3, Y0 + IN + .3, Y1 - IN - .3
L.poly((-97, 0), "aq-plan", P(xi0, yi0, SL), P(xi1, yi0, SL), P(xi1, yi1, SL), P(xi0, yi1, SL))
for gx in (-1.4, 1.4):
    L.line((-97, 0), "aq-plan", P(gx, yi0, SL), P(gx, yi1, SL))
L.line((-97, 0), "aq-plan", P(xi0, 0, SL), P(-1.4, 0, SL))
L.line((-97, 0), "aq-plan", P(1.4, 0, SL), P(xi1, 0, SL))
L.poly((-96, 0), "aq-gold", P(-.6, -.6, SL), P(.6, -.6, SL), P(.6, .6, SL), P(-.6, .6, SL), fill="rgba(215,168,62,.10)")
s = .16
for gx in GRID_X:
    for gy in GRID_Y:
        L.box(gx - s, gx + s, gy - s, gy + s, SL, z1, top="cap")
layers["gestao"] = (L, P(-2.6, Y1, PL * .5), "left")

# ---------- 02 · MARKETING — volumes modulares e uma vitrine em balanço ----------
z0, z1 = LEVELS[1][1], LEVELS[1][2]
L = Layer("marketing")
L.seam(z0)
L.box(X0 + .2, X1 - .2, Y0 + .2, Y1 - .2, z0, z0 + .25, top="slab", key=(-100, z0))
zb = z0 + .25
# volume principal com faixa de vidro contínua
L.box(-4.6, 1.0, -3.1, 2.6, zb, z1, key=(-60, zb))
L.poly((-59, zb), "aq-e", P(-4.6, 2.6, zb + .45), P(1.0, 2.6, zb + .45), P(1.0, 2.6, z1 - .3), P(-4.6, 2.6, z1 - .3), fill="url(#marketing-glass)")
facade_front(L, -4.6, 1.0, zb + .45, z1 - .3, 2.6, 7)
# segundo módulo, mais alto, recuado
L.box(1.2, 4.6, -3.1, 0.8, zb, z1, key=(-50, zb))
L.poly((-49, zb), "aq-e", P(4.6, -3.1, zb + .45), P(4.6, .8, zb + .45), P(4.6, .8, z1 - .3), P(4.6, -3.1, z1 - .3), fill="url(#marketing-glassr)")
facade_right(L, -3.1, .8, zb + .45, z1 - .3, 4.6, 5)
# vitrine em balanço: avança para fora da planta (a empresa indo ao mercado)
L.box(1.2, 4.6, 1.0, 4.3, zb + .35, z1, key=(10, zb))
L.poly((11, zb), "aq-e", P(1.2, 4.3, zb + .55), P(4.6, 4.3, zb + .55), P(4.6, 4.3, z1 - .15), P(1.2, 4.3, z1 - .15), fill="url(#marketing-glass)")
facade_front(L, 1.2, 4.6, zb + .55, z1 - .15, 4.3, 4)
L.line((12, z1), "aq-gold", P(1.2, 4.3, z1), P(4.6, 4.3, z1))
layers["marketing"] = (L, P(4.6, -1.6, (zb + z1) / 2), "right")

# ---------- 03 · ESTRUTURA — pilares, vigas e divisões ----------
z0, z1 = LEVELS[2][1], LEVELS[2][2]
L = Layer("estrutura")
L.seam(z0)
L.box(X0 + .2, X1 - .2, Y0 + .2, Y1 - .2, z0, z0 + .22, top="slab", key=(-100, z0))
zc, zt = z0 + .22, z1 - .2
# divisões internas (paredes baixas entre pilares)
L.box(-1.46, -1.34, -2.7, 0, zc, zt - .2, top="light", key=(-3.0, zc))
L.box(1.4, 4.2, -0.06, 0.06, zc, zt - .2, top="light", key=(2.0, zc))
c = .13
for gx in GRID_X:
    for gy in GRID_Y:
        L.box(gx - c, gx + c, gy - c, gy + c, zc, zt, top="light")
# vigas: anel perimetral e malha interna
for gy in GRID_Y:
    L.box(GRID_X[0] - c, GRID_X[-1] + c, gy - c, gy + c, zt, z1, top="light", key=(gy + 0.0, zt + 1))
for gx in GRID_X:
    L.box(gx - c, gx + c, GRID_Y[0] - c, GRID_Y[-1] + c, zt, z1, top="light", key=(gx + 0.01, zt + 1))
layers["estrutura"] = (L, P(-1.0, GRID_Y[-1] + c, (zc + zt) / 2), "left")

# ---------- 04 · TECNOLOGIA — pavimento de vidro com núcleo ----------
z0, z1 = LEVELS[3][1], LEVELS[3][2]
L = Layer("tecnologia")
L.seam(z0)
L.box(X0 + .2, X1 - .2, Y0 + .2, Y1 - .2, z0, z0 + .22, top="slab", key=(-100, z0))
zg, zf = z0 + .22, z1 - .22
# núcleo técnico, visto através do vidro
L.box(-1.0, 1.0, -1.0, 1.0, zg, zf, key=(-40, zg))
# cortina de vidro com montantes
L.poly((-30, zg), "aq-e", P(-4.4, 2.9, zg), P(4.4, 2.9, zg), P(4.4, 2.9, zf), P(-4.4, 2.9, zf), fill="url(#tecnologia-glass)")
L.poly((-30, zg), "aq-e", P(4.4, -2.9, zg), P(4.4, 2.9, zg), P(4.4, 2.9, zf), P(4.4, -2.9, zf), fill="url(#tecnologia-glassr)")
facade_front(L, -4.4, 4.4, zg, zf, 2.9, 11)
facade_right(L, -2.9, 2.9, zg, zf, 4.4, 7)
L.line((-29, zg), "aq-mull", P(-4.4, 2.9, (zg + zf) / 2), P(4.4, 2.9, (zg + zf) / 2))
L.line((-29, zg), "aq-mull", P(4.4, 2.9, (zg + zf) / 2), P(4.4, -2.9, (zg + zf) / 2))
# laje superior fina
L.box(X0 + .2, X1 - .2, Y0 + .2, Y1 - .2, zf, z1, top="slab", key=(50, zf))
layers["tecnologia"] = (L, P(4.4, -1.2, (zg + zf) / 2), "right")

# ---------- 05 · AUTOMAÇÃO — cobertura com brises e claraboia ----------
z0, z1 = LEVELS[4][1], LEVELS[4][2]
L = Layer("automacao")
L.seam(z0)
L.box(X0 + .1, X1 - .1, Y0 + .1, Y1 - .1, z0, z0 + .3, top="slab", key=(-100, z0))
zr = z0 + .3
L.line((-99, zr), "aq-gold", P(X0 + .1, Y1 - .1, zr), P(X1 - .1, Y1 - .1, zr))
L.line((-99, zr), "aq-gold", P(X1 - .1, Y1 - .1, zr), P(X1 - .1, Y0 + .1, zr))
L.box(-3.6, 3.6, -2.4, 2.4, zr, z1, key=(-50, zr))
facade_front(L, -3.6, 3.6, zr + .08, z1 - .08, 2.4, 18, cls="aq-dash")
facade_right(L, -2.4, 2.4, zr + .08, z1 - .08, 3.6, 12, cls="aq-dash")
sk = pts(P(-2.4, -1.4, z1), P(2.4, -1.4, z1), P(2.4, 1.4, z1), P(-2.4, 1.4, z1))
L.add((60, z1), f'<polygon class="aq-e" points="{sk}" fill="url(#automacao-glass)"/>')
for gx in (-1.2, 0, 1.2):
    L.line((61, z1), "aq-mull", P(gx, -1.4, z1), P(gx, 1.4, z1))
L.line((61, z1), "aq-mull", P(-2.4, 0, z1), P(2.4, 0, z1))
layers["automacao"] = (L, P(-1.5, 2.4, (zr + z1) / 2), "left")

# ---------- saída ----------
os.makedirs(os.path.join(ROOT, "public/hero"), exist_ok=True)
gen = {}
for i, (lid, za, zb) in enumerate(LEVELS):
    L, anchor, side = layers[lid]
    inner = L.markup()
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" fill="none"><style>{STYLE}</style>{inner}</svg>\n'
    open(os.path.join(ROOT, f"public/hero/camada-0{i+1}-{lid}.svg"), "w").write(svg)
    gen[lid] = {"src": f"/hero/camada-0{i+1}-{lid}.svg", "anchor": [round(anchor[0], 1), round(anchor[1], 1)], "side": side, "z": [za, zb]}

ts = "// GERADO por scripts/architecture/build_layers.py — não edite à mão.\n"
ts += f"export const ARQ_GAP_PX = {GAP * U};\n"
ts += f"export const ARQ_U = {U};\n"
ts += "/** Cada camada: arquivo SVG (viewBox 0 0 800 800, fundo transparente), ponto de identificação na borda e lado da linha. */\n"
ts += "export const ARQ_LAYERS = " + json.dumps(gen, ensure_ascii=False) + " as const;\n"
open(os.path.join(ROOT, "src/components/hero/layers.generated.ts"), "w").write(ts)
print({k: (v["anchor"], v["side"]) for k, v in gen.items()})
