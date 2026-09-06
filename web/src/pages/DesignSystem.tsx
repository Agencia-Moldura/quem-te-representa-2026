import { useState } from 'react'

import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  CardIcon,
  CardText,
  CardTitle,
  Checkbox,
  Chip,
  ChipGroup,
  Field,
  Icon,
  OptionCardGroup,
  Pagination,
  RadioGroup,
  SelectField,
  Stepper,
  StatusBadge,
  SwatchSelectGroup,
  TagToggleGroup,
  TextField,
} from '../ui'
import type { OptionCardItem, SwatchItem } from '../ui'

const CORES = [
  ['Violeta 900', '#4C1D95'],
  ['Violeta 700 · primary', '#6D28D9'],
  ['Violeta 600 · botão', '#7C3AED'],
  ['Violeta 400', '#A78BFA'],
  ['Violeta 100 · surface', '#EDE4FF'],
  ['Lima · accent', '#C4F165'],
  ['Tinta 900', '#1B1330'],
  ['Papel', '#F7F5FB'],
]

const GENEROS: OptionCardItem[] = [
  { value: 'F', label: 'Feminino', sub: 'ela/dela', icon: 'genero-feminino' },
  { value: 'M', label: 'Masculino', sub: 'ele/dele', icon: 'genero-masculino' },
  { value: 'NB', label: 'Não binário', sub: 'elu/delu', icon: 'genero-nao-binario' },
]

const FAIXAS: OptionCardItem[] = [
  { value: '18-24', label: '18 – 24', sub: 'anos' },
  { value: '25-34', label: '25 – 34', sub: 'anos' },
  { value: '35-44', label: '35 – 44', sub: 'anos' },
  { value: '45-59', label: '45 – 59', sub: 'anos' },
  { value: '60+', label: '60+', sub: 'anos' },
]

const CORES_RACA: SwatchItem[] = [
  { value: 'INDIGENA', label: 'Indígena', cor: '#D9A276' },
  { value: 'BRANCA', label: 'Branca', cor: '#F3D9AA' },
  { value: 'PRETA', label: 'Preta', cor: '#1B1330' },
  { value: 'PARDA', label: 'Parda', cor: '#C89876' },
  { value: 'AMARELA', label: 'Amarela', cor: '#E8CAA0' },
]

const PAUTAS = ['Educação', 'Saúde', 'Segurança', 'Meio ambiente', 'Economia', 'Habitação']

function Secao({ n, titulo, extra, children }: { n: string; titulo: string; extra?: string; children: React.ReactNode }) {
  return (
    <section className="qtr-doc-section">
      <h2>
        <span className="qtr-mono">{n} —</span>
        {titulo}
        {extra && <span className="qtr-mono">{extra}</span>}
      </h2>
      {children}
    </section>
  )
}

export function DesignSystem() {
  const [texto, setTexto] = useState('')
  const [genero, setGenero] = useState('')
  const [faixa, setFaixa] = useState('25-34')
  const [posicionamento, setPosicionamento] = useState('liberal')
  const [novidades, setNovidades] = useState(true)
  const [pautas, setPautas] = useState<string[]>(['Saúde'])
  const [corRaca, setCorRaca] = useState<string[]>(['PRETA'])
  const [chips, setChips] = useState(['Proteção à família', 'Educação', 'Segurança'])
  const [pagina, setPagina] = useState(1)
  const [passo, setPasso] = useState(1)

  return (
    <div className="qtr-scope qtr-doc">
      <header className="qtr-doc-header">
        <StatusBadge tone="info">Design system · v1.0</StatusBadge>
        <h1 className="qtr-display" style={{ marginTop: 18 }}>
          QTR<span style={{ color: 'var(--qtr-violet-700)' }}>.</span>UI
        </h1>
        <p className="qtr-body" style={{ maxWidth: 620, marginTop: 8 }}>
          Componentes React da identidade "Quem Te Representa". Espelha o arquivo do Claude Design.
          Ainda não aplicado às telas — ver <code>web/src/ui/README.md</code>.
        </p>
      </header>

      {/* 01 — COR */}
      <Secao n="01" titulo="Cor">
        <div className="qtr-doc-grid3">
          {CORES.map(([nome, hex]) => (
            <div key={hex} className="qtr-swatchcard">
              <div className="qtr-swatchcard-fill" style={{ background: hex, borderBottom: hex === '#F7F5FB' ? '1px solid var(--qtr-border)' : undefined }} />
              <div className="qtr-swatchcard-meta">
                <b>{nome}</b>
                <span className="qtr-mono">{hex}</span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* 02 — TIPOGRAFIA */}
      <Secao n="02" titulo="Tipografia" extra="Poppins · títulos · Lato · corpo">
        <Card padLg>
          <div className="qtr-doc-row">
            <span className="qtr-mono">Display 56 · 800</span>
            <div className="qtr-display">Junte-se a nós</div>
            <span className="qtr-mono">H1 36 · 700</span>
            <div className="qtr-h1">Uma pergunta pode transformar</div>
            <span className="qtr-mono">H2 24 · 700</span>
            <div className="qtr-h2">Para candidatos e parlamentares</div>
            <span className="qtr-mono">Body 16 · 400</span>
            <div className="qtr-body" style={{ maxWidth: 560 }}>
              Conhecer quem você vota é essencial para uma representação eficaz. O Match Eleitoral
              ajuda você a fazer essa escolha em poucos minutos.
            </div>
            <span className="qtr-mono">Small 13 · 500</span>
            <div className="qtr-small">Selecione até 3 pautas prioritárias</div>
            <span className="qtr-mono">Eyebrow 12 · 600</span>
            <div className="qtr-eyebrow">Match Eleitoral</div>
          </div>
        </Card>
      </Secao>

      {/* 03 — BOTÕES */}
      <Secao n="03" titulo="Botões">
        <Card padLg>
          <div className="qtr-doc-row">
            <span className="qtr-mono">Primary</span>
            <div className="qtr-doc-inline">
              <Button>Acessar jornada</Button>
              <Button variant="primary-dark">Começar o teste</Button>
              <Button disabled>Próximo passo</Button>
            </div>

            <span className="qtr-mono">Outline</span>
            <div className="qtr-doc-inline">
              <Button variant="outline-ink">Área do candidato</Button>
              <Button variant="outline">Conhecer os planos</Button>
            </div>

            <span className="qtr-mono">Accent</span>
            <div className="qtr-doc-inline">
              <Button variant="accent">Cadastrar-se</Button>
            </div>

            <span className="qtr-mono">Ícone + rótulo</span>
            <div className="qtr-doc-inline">
              <Button icon="user">Área do candidato</Button>
              <Button variant="ghost" iconRight="chevron-right">Acessar</Button>
              <Button size="sm" variant="outline">pequeno</Button>
            </div>

            <span className="qtr-mono">Paginação</span>
            <Pagination total={12} atual={pagina} onChange={setPagina} maxVisivel={12} />
          </div>
        </Card>
      </Secao>

      {/* 04 — FORMULÁRIOS */}
      <Secao n="04" titulo="Formulários">
        <div className="qtr-doc-grid2">
          <Card flat>
            <SelectField
              label="Gênero"
              placeholder="Selecionar"
              value={genero}
              onChange={setGenero}
              options={['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar']}
            />
            <SelectField
              label="Faixa etária"
              placeholder="Selecionar"
              value={faixa}
              onChange={setFaixa}
              options={[
                { value: '18-24', label: '18 – 24 anos' },
                { value: '25-34', label: '25 – 34 anos' },
                { value: '35-50', label: '35 – 50 anos' },
              ]}
            />
            <TextField
              label="E-mail"
              type="email"
              placeholder="Insira o seu e-mail"
              value={texto}
              onChange={setTexto}
              help="Usamos só para enviar seu resultado."
            />
          </Card>

          <Card flat>
            <RadioGroup
              label="Você tem um posicionamento político?"
              value={posicionamento}
              onChange={setPosicionamento}
              options={[
                { value: 'nao', label: 'Não possuo' },
                { value: 'nao-sei', label: 'Não sei apontar' },
                { value: 'conservador', label: 'Sim, sou conservador' },
                { value: 'liberal', label: 'Sim, sou liberal' },
              ]}
            />
            <Field label="Aceito receber comunicações">
              <Checkbox checked={novidades} onChange={setNovidades}>
                Sim, quero novidades sobre o QTR
              </Checkbox>
            </Field>
          </Card>

          <Card flat style={{ gridColumn: '1 / -1' }}>
            <OptionCardGroup
              label="Escolha visual · seleção em cartões"
              value={genero || 'M'}
              onChange={setGenero}
              options={GENEROS}
            />
            <OptionCardGroup
              label="Escolha visual · sem ícone"
              value={faixa}
              onChange={setFaixa}
              options={FAIXAS}
              plain
            />
            <TagToggleGroup
              label="Escolha visual · tags (união)"
              hint="marque quantas quiser"
              value={pautas}
              onChange={setPautas}
              options={PAUTAS}
            />
            <SwatchSelectGroup
              label="Cor/raça"
              hint="disco de cor + rótulo"
              value={corRaca}
              onChange={setCorRaca}
              options={CORES_RACA}
            />
          </Card>
        </div>
      </Secao>

      {/* 05 — CHIPS E ETIQUETAS */}
      <Secao n="05" titulo="Chips e etiquetas">
        <Card padLg>
          <div className="qtr-doc-row qtr-doc-row--top">
            <span className="qtr-mono">Removível</span>
            <ChipGroup>
              {chips.map((c) => (
                <Chip key={c} onRemove={() => setChips((xs) => xs.filter((x) => x !== c))}>
                  {c}
                </Chip>
              ))}
              {chips.length === 0 && <span className="qtr-small">(todos removidos)</span>}
            </ChipGroup>

            <span className="qtr-mono">Sobre mídia</span>
            <ChipGroup>
              <Chip variant="media">Combate à corrupção</Chip>
              <Chip variant="media">Economia</Chip>
              <Chip variant="media">Trabalho</Chip>
            </ChipGroup>

            <span className="qtr-mono">Contorno</span>
            <ChipGroup>
              <Chip variant="outline">Educação</Chip>
              <Chip variant="outline">Segurança</Chip>
            </ChipGroup>

            <span className="qtr-mono">Status</span>
            <div className="qtr-doc-inline">
              <StatusBadge tone="accent">QTR Cast</StatusBadge>
              <StatusBadge tone="solid">Novo</StatusBadge>
              <StatusBadge tone="warn">Em análise</StatusBadge>
              <StatusBadge tone="success">Deferido</StatusBadge>
              <StatusBadge tone="neutral">Rascunho</StatusBadge>
            </div>
          </div>
        </Card>
      </Secao>

      {/* 06 — NAVEGAÇÃO DE FLUXO */}
      <Secao n="06" titulo="Navegação de fluxo">
        <Card padLg>
          <Stepper
            steps={[
              { label: 'Sobre você' },
              { label: 'Sobre o candidato' },
              { label: 'Match!', opcional: true },
            ]}
            atual={passo}
            onStepClick={setPasso}
          />
          <div style={{ height: 36 }} />
          <Breadcrumb
            items={[
              { label: 'Página inicial', href: '#' },
              { label: 'Match eleitoral' },
            ]}
          />
        </Card>
      </Secao>

      {/* 07 — CARTÕES */}
      <Secao n="07" titulo="Cartões">
        <div className="qtr-doc-grid3">
          <Card>
            <CardIcon name="star" />
            <CardTitle>Match Eleitoral</CardTitle>
            <CardText>Conhecer quem você vota é essencial. Faça sua escolha em poucos minutos.</CardText>
            <div style={{ marginTop: 20 }}>
              <Button variant="ghost" iconRight="chevron-right">Acessar</Button>
            </div>
          </Card>
          <Card>
            <CardTitle>Quiz Político</CardTitle>
            <CardText>6 perguntas · 4 min</CardText>
            <div style={{ marginTop: 20 }}>
              <Button variant="ghost" iconRight="chevron-right">Acessar</Button>
            </div>
          </Card>
          <Card style={{ background: 'var(--qtr-violet-900)', color: '#fff' }}>
            <div className="qtr-display" style={{ fontSize: 40 }}>02/27</div>
            <p className="qtr-card-text" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Governadoras mulheres eleitas
            </p>
          </Card>
        </div>
      </Secao>

      {/* 08 — ALERTAS */}
      <Secao n="08" titulo="Alertas">
        <div className="qtr-doc-stack">
          <Alert tone="neutral">
            Não encontramos nenhum candidato com pelo menos uma pauta em comum. Selecione novas
            pautas para o match ideal.
          </Alert>
          <Alert tone="info">
            Você pode selecionar até 3 pautas prioritárias para refinar seus resultados.
          </Alert>
          <Alert tone="success">Perfil salvo com sucesso. Você já pode visualizar seus matches.</Alert>
          <Alert tone="warn">Esta candidatura está com o registro pendente de julgamento.</Alert>
        </div>
      </Secao>

      {/* 09 — MOTIVO DECORATIVO */}
      <Secao n="09" titulo="Motivo decorativo" extra="Círculos sobrepostos · violeta + lima">
        <div className="qtr-motif" style={{ height: 260 }}>
          <span className="qtr-motif-circle" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, background: 'var(--qtr-violet-200)' }} />
          <span className="qtr-motif-circle" style={{ left: '22%', top: '20%', width: 56, height: 56, background: 'var(--qtr-violet-300)' }} />
          <span className="qtr-motif-circle" style={{ left: '32%', bottom: '20%', width: 36, height: 36, background: 'var(--qtr-lime)' }} />
          <span className="qtr-motif-circle" style={{ right: '28%', top: '14%', width: 80, height: 80, background: 'var(--qtr-violet-700)' }} />
          <span className="qtr-motif-circle" style={{ right: '12%', bottom: '18%', width: 120, height: 120, background: 'var(--qtr-violet-900)' }} />
          <span style={{ position: 'absolute', left: 24, top: '42%' }}>
            <Chip variant="media">
              <Icon name="star" size={12} /> tamanhos livres · sobreposição
            </Chip>
          </span>
        </div>
      </Secao>
    </div>
  )
}
