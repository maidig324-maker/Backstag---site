"""
SISTEMA ARQUITETÔNICO DO HERO — perspectiva e alinhamento compartilhados.

Todas as camadas (Gestão, Marketing, Estrutura, Tecnologia, Automação) usam:
  * a MESMA tela: viewBox 0 0 800 800, fundo transparente;
  * a MESMA projeção isométrica suave (30°):
        px = OX + (x - y) * COS * U
        py = OY + (x + y) * SIN * U - z * U
  * a MESMA planta de 10 × 7 unidades (x de -5 a 5, y de -3.5 a 3.5) e a
    mesma malha de pilares (GRID_X × GRID_Y);
  * cada camada ocupa a sua faixa de altura (LEVELS): a base de uma é o
    topo da anterior, então o encaixe é exato quando o deslocamento é zero;
  * na vista explodida, a camada n sobe n × GAP unidades (o site anima isso).
Fonte da verdade: este arquivo. O site lê os valores gerados em
src/components/hero/layers.generated.ts.
"""
import math

U = 30.0
OX, OY = 400.0, 620.0
COS, SIN = math.cos(math.radians(30)), math.sin(math.radians(30))

FOOT = dict(x0=-5.0, x1=5.0, y0=-3.5, y1=3.5)
GRID_X = [-4.2, -1.4, 1.4, 4.2]
GRID_Y = [-2.7, 0.0, 2.7]

LEVELS = [
    ("gestao", 0.0, 1.6),
    ("marketing", 1.6, 3.2),
    ("estrutura", 3.2, 4.8),
    ("tecnologia", 4.8, 6.4),
    ("automacao", 6.4, 7.6),
]
GAP = 1.4  # afastamento entre camadas na vista explodida (unidades)


def P(x, y, z):
    return (OX + (x - y) * COS * U, OY + (x + y) * SIN * U - z * U)


def pts(*p):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in p)
