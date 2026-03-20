import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

type Vulnerability = {
  id: string;
  title: string;
  description: string;
  reference: string;
  severity: string;
};
type Severity = "high" | "medium" | "low" | "informational";
type SummaryData = {
  url: string;
  endTime: string;
  high: number;
  medium: number;
  low: number;
  info: number;
};

type VulnerabilityReportProps = {
  domain: string;
  summary: SummaryData;
  findings: Vulnerability[];
  date: string;
};

const severityColors: Record<Severity, string> = {
  high: "#f8d7da",
  medium: "#fff3cd",
  low: "#d1ecf1",
  informational: "#d4edda",
};

const severityLabels: Record<Severity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  informational: "Informational",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  headerBar: {
    backgroundColor: "#333",
    padding: 10,
    marginBottom: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  section: {
    marginTop:10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#222",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  text: {
    marginVertical: 2,
  },
  summaryContainer: {
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  findingContainer: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  vulnTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  badge: {
    fontSize: 10,
    padding: 2,
    borderRadius: 3,
    color: "#000",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
    color: "#999",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColorBox: {
    width: 10,
    height: 10,
    marginRight: 4,
    borderRadius: 2,
  },
});

const VulnerabilityReport = ({
  domain,
  summary,
  findings,
  date,
}: VulnerabilityReportProps) => {
  const getSeverityStyle = (severity: string) => {
    const normalized = severity.trim().toLowerCase();
    const severityMap: Record<string, Severity> = {
      high: "high",
      medium: "medium",
      low: "low",
      informational: "informational",
      info: "informational",
    };
    const key = severityMap[normalized] || "informational";
    const color = severityColors[key];
    return {
      ...styles.findingContainer,
      backgroundColor: color,
    };
  };


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerText}>Vulnerability Report</Text>
        </View>

        {/* General Info */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>General Information</Text>
          <Text style={styles.text}>Domain: {domain}</Text>
          <Text style={styles.text}>Report Date: {date}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.text}>URL Scanned: {summary.url}</Text>
            <Text style={styles.text}>Scan Completed: {summary.endTime}</Text>
            <View style={styles.summaryRow}>
              <Text>High: {summary.high}</Text>
              <Text>Medium: {summary.medium}</Text>
              <Text>Low: {summary.low}</Text>
              <Text>Info: {summary.info}</Text>
            </View>
          </View>
        </View>

        {/* Severity Legend */}
        <View style={styles.legend}>
          {Object.entries(severityColors).map(([level, color]) => (
            <View key={level} style={styles.legendItem}>
              <View style={{ ...styles.legendColorBox, backgroundColor: color }} />
              <Text>{severityLabels[level as Severity]}</Text>
            </View>
          ))}
        </View>

        {/* Findings */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Detailed Findings</Text>
          {findings.map((vuln) => {
            const severityKey = vuln.severity.toLowerCase() as Severity;
            const label = severityLabels[severityKey] || vuln.severity;
            return (
              <View key={vuln.id} style={getSeverityStyle(vuln.severity)}>
                <Text style={styles.vulnTitle}>{vuln.title}</Text>
                <Text style={{ ...styles.badge }}>{`Severity: ${label}`}</Text>
                <Text style={styles.text}>Description: {vuln.description}</Text>
                <Text style={styles.text}>Recommendation: {vuln.reference}</Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © Cyber-Security Team | Knowledgeq Interactive consultancy services
        </Text>
      </Page>
    </Document>
  );
};

export default VulnerabilityReport;
