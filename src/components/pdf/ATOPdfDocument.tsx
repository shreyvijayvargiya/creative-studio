import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ReactElement } from 'react'

import { getBudgetAmount } from '#/types'
import type { AtoTaxpayerInfo, BudgetRow } from '#/types'

interface AtoPdfDocumentProps {
  rows: BudgetRow[]
  taxpayer: AtoTaxpayerInfo
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111',
  },
  govHeader: {
    fontSize: 8,
    color: '#333',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  yearBadge: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  period: {
    fontSize: 9,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#e8e8e8',
    padding: 4,
    marginTop: 10,
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    marginBottom: 4,
    color: '#333',
  },
  boxRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  box: {
    width: 16,
    height: 18,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    fontSize: 9,
    paddingTop: 3,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  fieldCol: {
    flexGrow: 1,
  },
  valueLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 22,
    paddingTop: 8,
    paddingBottom: 2,
  },
  valueText: {
    fontSize: 9,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    fontSize: 8,
    paddingTop: 1,
  },
  incomeTable: {
    marginTop: 4,
  },
  incomeHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingVertical: 4,
    fontFamily: 'Helvetica-Bold',
  },
  incomeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  colLabel: { width: '55%' },
  colAmount: { width: '45%', textAlign: 'right' },
  signatureArea: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#999',
    paddingTop: 12,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 52,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 7,
    color: '#666',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

function TfnBoxes({ tfn }: { tfn: string }) {
  const digits = tfn.padEnd(9, ' ').split('').slice(0, 9)
  return (
    <View style={styles.boxRow}>
      {digits.map((digit, index) => (
        <Text key={`tfn-${index}`} style={styles.box}>
          {digit.trim()}
        </Text>
      ))}
    </View>
  )
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={styles.checkboxRow}>
      <Text style={styles.checkbox}>{checked ? 'X' : ''}</Text>
      <Text>{label}</Text>
    </View>
  )
}

function LabeledValue({
  label,
  value,
  width,
}: {
  label: string
  value: string
  width?: string
}) {
  return (
    <View style={[styles.fieldCol, width ? { width } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueLine}>
        <Text style={styles.valueText}>{value || ' '}</Text>
      </View>
    </View>
  )
}

export function createAtoPdfDocument({
  rows,
  taxpayer,
}: AtoPdfDocumentProps): ReactElement {
  const annualIncome = getBudgetAmount(rows, 'Annual Income')
  const taxWithheld = getBudgetAmount(rows, 'Tax Withheld')
  const gstOwed = getBudgetAmount(rows, 'GST Owed')
  const basAmount = getBudgetAmount(rows, 'BAS Amount')
  const netIncome = getBudgetAmount(rows, 'Net Income')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.govHeader}>
          Australian Government — Australian Taxation Office
        </Text>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Tax return for individuals</Text>
            <Text style={styles.period}>1 July 2024 to 30 June 2025</Text>
            <Text style={styles.period}>NAT 2541-6.2025</Text>
          </View>
          <Text style={styles.yearBadge}>2025</Text>
        </View>

        <Text style={styles.sectionTitle}>Individual information</Text>

        <Text style={styles.label}>Tax file number</Text>
        <TfnBoxes tfn={taxpayer.tfn} />

        <Checkbox
          checked={taxpayer.isAustralianResident}
          label="Are you an Australian resident? — Yes"
        />
        <Checkbox
          checked={!taxpayer.isAustralianResident}
          label="Are you an Australian resident? — No"
        />

        <Text style={[styles.label, { marginTop: 4 }]}>
          Your name (print your full name)
        </Text>
        <View style={styles.fieldRow}>
          <LabeledValue label="Title" value={taxpayer.title} width="20%" />
          <LabeledValue
            label="Surname or family name"
            value={taxpayer.surname}
            width="40%"
          />
          <LabeledValue
            label="First given name"
            value={taxpayer.firstName}
            width="40%"
          />
        </View>

        <Checkbox
          checked={taxpayer.nameChanged}
          label="Has any part of your name changed since completing your last tax return? — Yes"
        />
        <Checkbox
          checked={!taxpayer.nameChanged}
          label="Has any part of your name changed since completing your last tax return? — No"
        />

        <Text style={[styles.label, { marginTop: 4 }]}>Postal address</Text>
        <View style={styles.valueLine}>
          <Text style={styles.valueText}>{taxpayer.postalAddress || ' '}</Text>
        </View>

        <View style={[styles.fieldRow, { marginTop: 10 }]}>
          <LabeledValue label="Suburb / Town" value={taxpayer.suburb} width="50%" />
          <LabeledValue label="State" value={taxpayer.state} width="20%" />
          <LabeledValue label="Postcode" value={taxpayer.postcode} width="30%" />
        </View>

        <Checkbox
          checked={taxpayer.homeAddressDifferent}
          label="Is your home address different from your postal address? — Yes"
        />
        <Checkbox
          checked={!taxpayer.homeAddressDifferent}
          label="Is your home address different from your postal address? — No"
        />

        {taxpayer.homeAddressDifferent ? (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.label}>Home address</Text>
            <View style={styles.valueLine}>
              <Text style={styles.valueText}>
                {taxpayer.homeAddress || ' '}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Income and deductions (from budget planner)
        </Text>

        <View style={styles.incomeTable}>
          <View style={styles.incomeHeader}>
            <Text style={styles.colLabel}>Item</Text>
            <Text style={styles.colAmount}>Amount (AUD)</Text>
          </View>
          {[
            ['Annual income', annualIncome],
            ['Tax withheld', taxWithheld],
            ['GST owed', gstOwed],
            ['BAS amount', basAmount],
            ['Net income', netIncome],
          ].map(([label, amount]) => (
            <View key={label} style={styles.incomeRow}>
              <Text style={styles.colLabel}>{label}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(amount as number)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureArea}>
          <Text style={styles.signatureLabel}>
            Declaration — Authorised signature
          </Text>
          <View style={styles.signatureLine} />
        </View>

        <View style={styles.footer} fixed>
          <Text>Tax return for individuals — 2025</Text>
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
