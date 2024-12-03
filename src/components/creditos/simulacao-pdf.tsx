import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { useMemo } from 'react';

// Registrar fontes
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

interface SimulacaoPDFProps {
  simulacoes?: any[] | any;
  simulacao?: any;
  dadosCliente?: {
    nome_cliente: string;
    cpf: string;
    consultor: string;
  };
}

const styles = StyleSheet.create({
  viewer: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#1e293b', // slate-800
    border: 'none',
  },
  page: {
    // fontFamily: 'Roboto',
    padding: '20 30',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.08,
    width: '90%',  
    height: 'auto',
    zIndex: 0,    
  },
  logo: {
    width: 120,
    height: 'auto',
    marginBottom: 10,
  },
  pageContent: {
    flex: 1,
    flexDirection: 'column',
    zIndex: 1,    
    position: 'relative',
  },
  header: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#f97316',
    borderBottomStyle: 'solid',
    width: '100%',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  documentNumber: {
    fontSize: 9,
    color: '#666666',
  },
  title: {
    fontSize: 18,
    color: '#f97316',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  clientSection: {
    marginBottom: 15,
    padding: '10 15',
    backgroundColor: '#fff7ed',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#f97316',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  clientInfo: {
    gap: 6,
  },
  simulationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  simulationCard: {
    flex: 1,
    minWidth: '48%',
    padding: '10 15',
    backgroundColor: '#fff7ed',
    borderRadius: 4,
  },
  simulationTitle: {
    fontSize: 12,
    color: '#f97316',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  simulationNumber: {
    fontSize: 10,
    color: '#52525b',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  label: {
    fontSize: 9,
    color: '#52525b',
    flex: 1,
  },
  value: {
    fontSize: 9,
    color: '#18181b',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#f97316',
    borderTopStyle: 'solid',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export function SimulacaoPDF({ simulacoes, simulacao, dadosCliente }: SimulacaoPDFProps) {
  const currentDate = useMemo(() => {
    if (simulacao?.data_criacao) {
      return new Date(simulacao.data_criacao).toLocaleDateString('pt-BR');
    }
    if (simulacoes?.[0]?.data_criacao) {
      return new Date(simulacoes[0].data_criacao).toLocaleDateString('pt-BR');
    }
    return new Date().toLocaleDateString('pt-BR');
  }, [simulacao, simulacoes]);

  // Determinar os dados a serem usados
  const dadosParaExibir = useMemo(() => {
    if (Array.isArray(simulacoes) && simulacoes.length > 0) {
      return {
        simulacoes,
        cliente: dadosCliente || {
          nome_cliente: simulacoes[0]?.nome_cliente || '',
          cpf: simulacoes[0]?.cpf || '',
          consultor: simulacoes[0]?.consultor || ''
        }
      };
    }
    
    if (simulacao) {
      return {
        simulacoes: [simulacao],
        cliente: dadosCliente || {
          nome_cliente: simulacao.nome_cliente || '',
          cpf: simulacao.cpf || '',
          consultor: simulacao.consultor || ''
        }
      };
    }
    
    return {
      simulacoes: [],
      cliente: dadosCliente || {
        nome_cliente: '',
        cpf: '',
        consultor: ''
      }
    };
  }, [simulacoes, simulacao, dadosCliente]);

  return (
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.page}>
          <Image 
            src="/images/watermark.png"
            style={styles.watermark}
          />
          <View style={styles.pageContent}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Image 
                  src="/images/logo.png"
                  style={styles.logo}
                />
                <View style={styles.headerRight}>
                  <Text style={styles.date}>Data: {currentDate}</Text>
                  <Text style={styles.documentNumber}>
                    Doc. Nº {dadosParaExibir.simulacoes[0]?.numero || ''}
                  </Text>
                </View>
              </View>
              <View style={styles.headerLine} />
            </View>

            <Text style={styles.title}>Simulações de Crédito</Text>

            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Dados do Cliente</Text>
              <View style={styles.clientInfo}>
                <View style={styles.row}>
                  <Text style={styles.label}>Nome:</Text>
                  <Text style={styles.value}>{dadosParaExibir.cliente.nome_cliente}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>CPF:</Text>
                  <Text style={styles.value}>{dadosParaExibir.cliente.cpf}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Consultor:</Text>
                  <Text style={styles.value}>{dadosParaExibir.cliente.consultor}</Text>
                </View>
              </View>
            </View>

            <View style={styles.simulationsContainer}>
              {dadosParaExibir.simulacoes.map((sim, index) => (
                <View key={index} style={styles.simulationCard}>
                  <Text style={styles.simulationTitle}>Simulação {index + 1}</Text>
                  <Text style={styles.simulationNumber}>{sim.numero}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Valor do Bem:</Text>
                    <Text style={styles.value}>
                      {typeof sim.valor_emprestimo === 'number' 
                        ? `R$ ${sim.valor_emprestimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : 'R$ 0,00'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Valor da Entrada:</Text>
                    <Text style={styles.value}>
                      {typeof sim.valor_entrada === 'number' 
                        ? `R$ ${sim.valor_entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : 'R$ 0,00'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Valor das Parcelas:</Text>
                    <Text style={styles.value}>
                      240x de {typeof sim.valor_parcela === 'number' 
                        ? `R$ ${sim.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : 'R$ 0,00'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
              facilitacredsinop.com.br | Telefone: (66) 99207-3183
              </Text>
              <Text style={styles.footerText}>
                Endereço: Rua das Pitangueiras, 274, setor industria, cep 78550-274, Sinop, MT
              </Text>
              <Text style={styles.footerText}>
                Todos os direitos reservados 2024 Facilita Cred
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};
