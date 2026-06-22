import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ReactElement } from 'react'

import { calculateNetIncome  } from '#/types'
import type {BudgetRow} from '#/types';

interface FinancialPdfDocumentProps {
  rows: BudgetRow[]
  signature: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '45%',
    left: '15%',
    fontSize: 64,
    color: '#d4d4d4',
    transform: 'rotate(-35deg)',
    opacity: 0.35,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  date: {
    fontSize: 10,
    color: '#525252',
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  totalsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: '#a3a3a3',
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
  },
  colCategory: { width: '32%' },
  colAmount: { width: '18%', textAlign: 'right' },
  colTax: { width: '18%', textAlign: 'right' },
  colNotes: { width: '32%' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#737373',
  },
  signatureSection: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#d4d4d4',
  },
  signatureLabel: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  signatureImage: {
    width: 200,
    height: 48,
    objectFit: 'contain',
  },
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

export function createFinancialPdfDocument({
  rows,
  signature,
}: FinancialPdfDocumentProps): ReactElement {
  const generatedAt = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const netIncome = calculateNetIncome(rows)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENTIAL</Text>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Financial Summary Report</Text>
          <Text style={styles.date}>{generatedAt}</Text>
        </View>

        <View style={styles.rule} />

        <View style={styles.tableHeader}>
          <Text style={styles.colCategory}>Category</Text>
          <Text style={styles.colAmount}>Amount (AUD)</Text>
          <Text style={styles.colTax}>Tax Rate</Text>
          <Text style={styles.colNotes}>Notes</Text>
        </View>

        {rows.map((row, index) => (
          <View
            key={`${row.category}-${index}`}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={styles.colCategory}>{row.category}</Text>
            <Text style={styles.colAmount}>{formatCurrency(row.amount)}</Text>
            <Text style={styles.colTax}>{row.taxRate}%</Text>
            <Text style={styles.colNotes}>{row.notes}</Text>
          </View>
        ))}

        <View style={styles.totalsRow}>
          <Text style={styles.colCategory}>Net Income</Text>
          <Text style={styles.colAmount}>{formatCurrency(netIncome)}</Text>
          <Text style={styles.colTax} />
          <Text style={styles.colNotes} />
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.signatureLabel}>Authorised Signature</Text>
          <Image src={signature} style={styles.signatureImage} />
        </View>

        <View style={styles.footer} fixed>
          <Text>Confidential — Do not distribute</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
