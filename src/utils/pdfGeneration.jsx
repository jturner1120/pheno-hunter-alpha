// src/utils/pdfGeneration.js
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { logInfo, logError, logPerformance } from './logger';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 10,
  },
  metadata: {
    fontSize: 10,
    color: '#a0aec0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#4a5568',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e2e8f0',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
  },
  tableColHeader: {
    backgroundColor: '#f7fafc',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  chart: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#a0aec0',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    width: '45%',
    padding: 10,
    backgroundColor: '#f7fafc',
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
});

/**
 * Generate PDF report from React components
 * @param {React.Component} ReportComponent - The report component to render
 * @param {Object} data - Data to pass to the report component
 * @param {string} filename - Name for the generated PDF file
 * @returns {Promise<Blob>} - PDF blob for download
 */
export const generatePDFReport = async (ReportComponent, data, filename = 'report') => {
  try {
    const startTime = performance.now();
    
    // Create PDF document
    const doc = <ReportComponent data={data} styles={styles} />;
    
    // Generate PDF blob
    const blob = await pdf(doc).toBlob();
    
    const duration = performance.now() - startTime;
    logPerformance('generatePDFReport', duration, { 
      filename, 
      size: blob.size,
      dataKeys: Object.keys(data || {}) 
    });
    
    return blob;
  } catch (error) {
    logError(error, { operation: 'generatePDFReport', filename, data });
    throw error;
  }
};

/**
 * Download PDF blob as file
 * @param {Blob} blob - PDF blob
 * @param {string} filename - Download filename
 */
export const downloadPDF = (blob, filename) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    logInfo(`PDF downloaded: ${filename}.pdf`);
  } catch (error) {
    logError(error, { operation: 'downloadPDF', filename });
    throw error;
  }
};

/**
 * Base Plant Report Template
 */
export const PlantReportTemplate = ({ data, styles }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Plant Report</Text>
        <Text style={styles.subtitle}>{data.plant?.name || 'Unknown Plant'}</Text>
        <Text style={styles.metadata}>
          Generated on {new Date().toLocaleDateString()} • PhenoHunter Pro
        </Text>
      </View>

      {/* Plant Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plant Overview</Text>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Strain</Text>
            <Text style={styles.statValue}>{data.plant?.strain || 'N/A'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Stage</Text>
            <Text style={styles.statValue}>{data.plant?.stage || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Days in Cultivation</Text>
            <Text style={styles.statValue}>{data.daysInCultivation || '0'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Health Status</Text>
            <Text style={styles.statValue}>{data.plant?.health || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Growth Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Growth Metrics</Text>
        {data.metrics && (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Metric</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Current</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Previous</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Change</Text>
              </View>
            </View>
            {Object.entries(data.metrics).map(([key, value]) => (
              <View style={styles.tableRow} key={key}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{key}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{value.current || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{value.previous || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{value.change || 'N/A'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {data.recentActivity?.map((activity, index) => (
          <View key={index} style={{ marginBottom: 8 }}>
            <Text style={[styles.content, { fontSize: 10 }]}>
              {activity.date} - {activity.type}: {activity.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Notes */}
      {data.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.content}>{data.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        PhenoHunter - Advanced Cannabis Cultivation Management
      </Text>
    </Page>
  </Document>
);

/**
 * Strain Performance Report Template
 */
export const StrainReportTemplate = ({ data, styles }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Strain Performance Report</Text>
        <Text style={styles.subtitle}>{data.strain?.name || 'Multiple Strains'}</Text>
        <Text style={styles.metadata}>
          Generated on {new Date().toLocaleDateString()} • PhenoHunter Pro
        </Text>
      </View>

      {/* Summary Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Plants</Text>
            <Text style={styles.statValue}>{data.summary?.totalPlants || '0'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Success Rate</Text>
            <Text style={styles.statValue}>{data.summary?.successRate || '0%'}</Text>
          </View>
        </View>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Yield</Text>
            <Text style={styles.statValue}>{data.summary?.averageYield || 'N/A'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Cycle Time</Text>
            <Text style={styles.statValue}>{data.summary?.averageCycleTime || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Performance by Stage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance by Growth Stage</Text>
        {data.stagePerformance && (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Stage</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Avg Duration</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Success Rate</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColHeader]}>
                <Text style={styles.tableCellHeader}>Issues</Text>
              </View>
            </View>
            {Object.entries(data.stagePerformance).map(([stage, performance]) => (
              <View style={styles.tableRow} key={stage}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{stage}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{performance.duration || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{performance.successRate || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{performance.issues || '0'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.footer}>
        PhenoHunter - Advanced Cannabis Cultivation Management
      </Text>
    </Page>
  </Document>
);

/**
 * Growth Summary Report Template
 */
export const GrowthSummaryTemplate = ({ data, styles }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Growth Summary Report</Text>
        <Text style={styles.subtitle}>
          {data.period?.start} - {data.period?.end}
        </Text>
        <Text style={styles.metadata}>
          Generated on {new Date().toLocaleDateString()} • PhenoHunter Pro
        </Text>
      </View>

      {/* Period Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Period Overview</Text>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Plants</Text>
            <Text style={styles.statValue}>{data.overview?.activePlants || '0'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed Cycles</Text>
            <Text style={styles.statValue}>{data.overview?.completedCycles || '0'}</Text>
          </View>
        </View>
        <View style={styles.flexRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Yield</Text>
            <Text style={styles.statValue}>{data.overview?.totalYield || 'N/A'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Growth Rate</Text>
            <Text style={styles.statValue}>{data.overview?.avgGrowthRate || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Key Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Achievements</Text>
        {data.achievements?.map((achievement, index) => (
          <Text key={index} style={[styles.content, { marginBottom: 5 }]}>
            • {achievement}
          </Text>
        ))}
      </View>

      {/* Areas for Improvement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        {data.improvements?.map((improvement, index) => (
          <Text key={index} style={[styles.content, { marginBottom: 5 }]}>
            • {improvement}
          </Text>
        ))}
      </View>

      <Text style={styles.footer}>
        PhenoHunter - Advanced Cannabis Cultivation Management
      </Text>
    </Page>
  </Document>
);

export default {
  generatePDFReport,
  downloadPDF,
  PlantReportTemplate,
  StrainReportTemplate,
  GrowthSummaryTemplate,
  styles,
};
