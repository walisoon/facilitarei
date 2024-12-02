'use client';

import { useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet
} from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { 
  Card, 
  Title, 
  AreaChart, 
  DonutChart, 
  BarChart,
  LineChart,
  List,
  ListItem,
  Badge,
  Text,
  Metric,
  Flex,
  ProgressBar,
  Grid,
  Col
} from '@tremor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const stats = [
  { name: 'Créditos Ativos', value: 'R$ 150.000', icon: CreditCard, change: '+12%' },
  { name: 'Total de Clientes', value: '125', icon: Users, change: '+4%' },
  { name: 'Taxa de Aprovação', value: '78%', icon: CheckCircle2, change: '+2.1%' },
  { name: 'Valor Médio', value: 'R$ 3.500', icon: DollarSign, change: '+5%' },
];

const chartdata = [
  {
    date: 'Jan',
    Aprovados: 2400,
    Pendentes: 1398,
    Negados: 800,
  },
  {
    date: 'Fev',
    Aprovados: 1398,
    Pendentes: 1800,
    Negados: 600,
  },
  {
    date: 'Mar',
    Aprovados: 9800,
    Pendentes: 2400,
    Negados: 400,
  },
  {
    date: 'Abr',
    Aprovados: 3908,
    Pendentes: 2400,
    Negados: 500,
  },
  {
    date: 'Mai',
    Aprovados: 4800,
    Pendentes: 2800,
    Negados: 300,
  },
  {
    date: 'Jun',
    Aprovados: 3800,
    Pendentes: 2400,
    Negados: 200,
  },
];

const donutData = [
  { name: 'Aprovados', value: 65 },
  { name: 'Pendentes', value: 25 },
  { name: 'Negados', value: 10 },
];

const inadimplenciaData = [
  {
    mes: 'Jan',
    taxa: 2.4,
  },
  {
    mes: 'Fev',
    taxa: 2.8,
  },
  {
    mes: 'Mar',
    taxa: 2.2,
  },
  {
    mes: 'Abr',
    taxa: 2.9,
  },
  {
    mes: 'Mai',
    taxa: 2.3,
  },
  {
    mes: 'Jun',
    taxa: 2.1,
  },
];

const faixasValor = [
  { faixa: 'Até R$ 1.000', quantidade: 30 },
  { faixa: 'R$ 1.001 - R$ 3.000', quantidade: 45 },
  { faixa: 'R$ 3.001 - R$ 5.000', quantidade: 25 },
  { faixa: 'R$ 5.001 - R$ 10.000', quantidade: 15 },
  { faixa: 'Acima de R$ 10.000', quantidade: 10 },
];

const metasMensais = [
  { meta: 'Novos Clientes', atual: 85, objetivo: 100 },
  { meta: 'Volume de Crédito', atual: 75, objetivo: 100 },
  { meta: 'Taxa de Conversão', atual: 92, objetivo: 100 },
  { meta: 'Satisfação do Cliente', atual: 88, objetivo: 100 },
];

const alertasRecentes = [
  { tipo: 'Crítico', mensagem: 'Cliente em atraso há mais de 90 dias', valor: 'R$ 5.000' },
  { tipo: 'Médio', mensagem: 'Análise de crédito pendente há 5 dias', valor: 'R$ 3.000' },
  { tipo: 'Baixo', mensagem: 'Documentação incompleta', valor: 'R$ 2.000' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    name: string;
    fill?: string;
    dataKey?: string;
  }>;
  label?: string;
}

export default function DashboardPage() {
  const { setTitle } = usePage();

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden bg-white dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
                  <stat.icon
                    className="h-6 w-6 text-orange-600 dark:text-orange-500"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  vs último mês
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="space-x-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="risk">Gestão de Risco</TabsTrigger>
          <TabsTrigger value="goals">Metas e Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Evolução de Créditos</Title>
              <AreaChart
                className="mt-4 h-72"
                data={chartdata}
                index="date"
                categories={["Aprovados", "Pendentes", "Negados"]}
                colors={["emerald", "yellow", "rose"]}
                valueFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                showAnimation
                showLegend
                showGridLines={false}
              />
            </Card>

            <Card className="col-span-3 bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Distribuição de Status</Title>
              <DonutChart
                className="mt-4 h-72"
                data={donutData}
                category="value"
                index="name"
                colors={["emerald", "yellow", "rose"]}
                valueFormatter={(value) => `${value}%`}
                showAnimation
                showTooltip
              />
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Alertas Recentes</Title>
              <List className="mt-4">
                {alertasRecentes.map((alerta) => (
                  <ListItem key={alerta.mensagem}>
                    <Flex justifyContent="start" className="gap-3">
                      <AlertTriangle 
                        className={
                          alerta.tipo === 'Crítico' 
                            ? 'text-red-500' 
                            : alerta.tipo === 'Médio'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                        } 
                      />
                      <div className="space-y-1">
                        <Text className="font-medium dark:text-white">
                          {alerta.mensagem}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400">
                          Valor: {alerta.valor}
                        </Text>
                      </div>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Metas do Mês</Title>
              <div className="mt-4 space-y-4">
                {metasMensais.map((meta) => (
                  <div key={meta.meta} className="space-y-2">
                    <Flex>
                      <Text className="dark:text-white">{meta.meta}</Text>
                      <Text className="dark:text-white">{meta.atual}%</Text>
                    </Flex>
                    <ProgressBar value={meta.atual} color="indigo" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
            <Col numColSpan={1} numColSpanLg={2}>
              <Card className="bg-white dark:bg-gray-800">
                <div className="p-6">
                  <Title className="text-gray-900 dark:text-white mb-4">Análise de Créditos por Mês</Title>
                  <Text className="text-gray-500 dark:text-gray-400 mb-6">
                    Acompanhamento mensal do volume de créditos por status
                  </Text>
                  <div className="mt-8">
                    <BarChart
                      className="h-96"
                      data={chartdata}
                      index="date"
                      categories={["Aprovados", "Pendentes", "Negados"]}
                      colors={["emerald", "amber", "rose"]}
                      valueFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                      showAnimation={true}
                      showLegend={true}
                      showGridLines={false}
                      stack={true}
                      yAxisWidth={80}
                      customTooltip={({ active, payload, label }: CustomTooltipProps) => {
                        if (!active || !payload || !payload.length) return null;
                        const total = payload.reduce((sum, entry) => sum + (Number(entry?.value) || 0), 0);
                        return (
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-900 dark:text-white font-medium mb-2">
                              {payload[0].payload.date}
                            </div>
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {entry.name}: R$ {(entry.value / 1000).toFixed(1)}k
                                </span>
                              </div>
                            ))}
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-gray-900 dark:text-white font-medium">
                                Total: R$ {(total / 1000).toFixed(1)}k
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-0">
                      <Text className="text-emerald-600 dark:text-emerald-400">Aprovados</Text>
                      <Metric className="text-emerald-600 dark:text-emerald-400">75%</Metric>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-900/20 border-0">
                      <Text className="text-amber-600 dark:text-amber-400">Pendentes</Text>
                      <Metric className="text-amber-600 dark:text-amber-400">15%</Metric>
                    </Card>
                    <Card className="bg-rose-50 dark:bg-rose-900/20 border-0">
                      <Text className="text-rose-600 dark:text-rose-400">Negados</Text>
                      <Metric className="text-rose-600 dark:text-rose-400">10%</Metric>
                    </Card>
                  </div>
                </div>
              </Card>
            </Col>
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <Title className="text-gray-900 dark:text-white mb-4">Distribuição por Faixa de Valor</Title>
                <Text className="text-gray-500 dark:text-gray-400 mb-6">
                  Quantidade de clientes por faixa de crédito
                </Text>
                <div className="mt-8">
                  <BarChart
                    className="h-96"
                    data={faixasValor}
                    index="faixa"
                    categories={["quantidade"]}
                    colors={["indigo"]}
                    valueFormatter={(value) => `${value} clientes`}
                    showAnimation={true}
                    layout="vertical"
                    showLegend={false}
                    showGridLines={false}
                    customTooltip={({ payload, label }: CustomTooltipProps) => {
                      if (!payload || !payload.length) return null;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-gray-900 dark:text-white font-medium mb-2">
                            {payload[0].payload.faixa}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {payload[0].value} clientes
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
                <div className="mt-6">
                  <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-0">
                    <Flex>
                      <div>
                        <Text className="text-indigo-600 dark:text-indigo-400">Faixa mais comum</Text>
                        <Metric className="text-indigo-600 dark:text-indigo-400">R$ 1.001 - R$ 3.000</Metric>
                      </div>
                      <div className="text-right">
                        <Text className="text-indigo-600 dark:text-indigo-400">Clientes</Text>
                        <Metric className="text-indigo-600 dark:text-indigo-400">45</Metric>
                      </div>
                    </Flex>
                  </Card>
                </div>
              </div>
            </Card>
          </Grid>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
            <Col numColSpan={1} numColSpanLg={2}>
              <Card className="bg-white dark:bg-gray-800">
                <Title className="text-gray-900 dark:text-white">Taxa de Inadimplência</Title>
                <LineChart
                  className="mt-4 h-80"
                  data={inadimplenciaData}
                  index="mes"
                  categories={["taxa"]}
                  colors={["rose"]}
                  valueFormatter={(value) => `${value}%`}
                  showAnimation
                  showLegend
                  showGridLines={false}
                  yAxisWidth={40}
                />
              </Card>
            </Col>
            <Card className="bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Indicadores de Risco</Title>
              <div className="mt-4 space-y-4">
                <Flex>
                  <Text className="dark:text-white">Score Médio dos Clientes</Text>
                  <Metric className="dark:text-white">720</Metric>
                </Flex>
                <Separator />
                <Flex>
                  <Text className="dark:text-white">Taxa de Recuperação</Text>
                  <Metric className="dark:text-white">65%</Metric>
                </Flex>
                <Separator />
                <Flex>
                  <Text className="dark:text-white">Provisão para Perdas</Text>
                  <Metric className="dark:text-white">R$ 25.000</Metric>
                </Flex>
              </div>
            </Card>
          </Grid>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
            <Card className="bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">Desempenho Anual</Title>
              <div className="mt-4 space-y-4">
                <Flex>
                  <Text className="dark:text-white">Meta Anual</Text>
                  <Metric className="dark:text-white">R$ 2M</Metric>
                </Flex>
                <ProgressBar value={75} color="indigo" />
                <Text className="dark:text-white text-center">
                  75% da meta atingida
                </Text>
              </div>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <Title className="text-gray-900 dark:text-white">KPIs Principais</Title>
              <div className="mt-4 space-y-4">
                <Flex>
                  <Text className="dark:text-white">CAC</Text>
                  <Metric className="dark:text-white">R$ 250</Metric>
                </Flex>
                <Separator />
                <Flex>
                  <Text className="dark:text-white">LTV Médio</Text>
                  <Metric className="dark:text-white">R$ 1.500</Metric>
                </Flex>
                <Separator />
                <Flex>
                  <Text className="dark:text-white">ROI</Text>
                  <Metric className="dark:text-white">185%</Metric>
                </Flex>
              </div>
            </Card>
          </Grid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
