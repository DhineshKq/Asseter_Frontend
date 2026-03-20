import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';
import LOGO_URL from "../../../assets/logos/kqLogo.png";

interface ReconPdfProps {
  domain: string;
  subdomains: string[];
  reachableSubdomains: string[];
  scanDate?: string;
  pieChartBase64: string;
}

const styles = StyleSheet.create({

  headerContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderBottom: '2px solid #1565c0',
    paddingBottom: 10,
    height: 40,
  },

  logo: {
    width: 30,
    height: 25,
    marginRight: 10,
  },
  headerTitleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#fdfdfd',
    color: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2px solid #1976d2',
    paddingBottom: 10,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'right',
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  infoBox: {
    padding: 12,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#e3f2fd',
    lineHeight: 1,
  },
  label: {
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
    borderBottom: '1px solid #90caf9',
    paddingBottom: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#bbdefb',
    padding: 6,
    borderBottom: '1px solid #90caf9',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #eeeeee',
  },
  colIndex: {
    width: '10%',
    textAlign: 'center',
  },
  colDomain: {
    width: '60%',
  },
  colReachable: {
    width: '30%',
    textAlign: 'center',
  },
  pieChart: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginVertical: 10,
    // border: '1px solid #ccc',
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
    color: '#999',
    borderTop: '1px solid #ccc',
    paddingTop: 5,
  }
});

const ReconPdfReport: React.FC<ReconPdfProps> = ({
  domain,
  subdomains,
  reachableSubdomains,
  scanDate,
  pieChartBase64
}) => {
  const scanTime = scanDate || new Date().toLocaleString();

  const isReachable = (sub: string) => reachableSubdomains.includes(sub) ? "Yes" : "No";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image src={LOGO_URL} style={styles.logo} />
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>Reconnaissance Report</Text>
          </View>
        </View>


        {/* Domain Info */}
        <View style={[styles.section, styles.infoBox]}>
          <Text><Text style={styles.label}>Domain Scanned: </Text>{domain}</Text>
          <Text><Text style={styles.label}>Scan Time: </Text>{scanTime}</Text>
          <Text>
            <Text style={styles.label}>Total Subdomains: </Text>{subdomains.length}{" "}
            | <Text style={styles.label}>Reachable: </Text>{reachableSubdomains.length}
          </Text>
        </View>

        {/* Pie Chart */}
        {pieChartBase64 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subdomain Reachability Chart</Text>
            <Image src={pieChartBase64} style={styles.pieChart} />
          </View>
        )}

        {/* Subdomains Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subdomain Summary</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.colIndex}>#</Text>
            <Text style={styles.colDomain}>Discovered Subdomain</Text>
            <Text style={styles.colReachable}>Reachable</Text>
          </View>

          {subdomains.length > 0 ? (
            subdomains.map((sub, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colIndex}>{i + 1}</Text>
                <Text style={styles.colDomain}>{sub}</Text>
                <Text style={styles.colReachable}>{isReachable(sub)}</Text>
              </View>
            ))
          ) : (
            <Text>No subdomains found.</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
        © Cyber-Security Team | Knowledgeq Interactive consultancy services
        </Text>
      </Page>
    </Document>
  );
};

export default ReconPdfReport;
