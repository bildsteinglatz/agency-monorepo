import { defineType, defineField, useFormValue } from 'sanity'
import React, { useState, useCallback } from 'react'
import { Stack, Card, Text, Button, Flex, Box, Badge } from '@sanity/ui'
import { InputProps } from 'sanity'

// Custom Input Component for the "Process" Action
function ReceiptActions(props: InputProps) {
  const id = useFormValue(['_id']) as string
  const status = useFormValue(['status']) as string
  const dropboxPath = useFormValue(['dropboxPath']) as string
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const processReceipt = useCallback(async () => {
    if (!id) return
    if (id.startsWith('drafts.')) return alert('Please publish the document first.')

    setLoading(true)
    setMessage('Processing...')

    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://www.halle5.at'
      const res = await fetch(`${baseUrl}/api/accounting/process-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setMessage('Success! Receipt sent & archived.')
        // Ideally, we would refresh the document here, but a page reload works for now
        window.location.reload()
      } else {
        setMessage(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage('Network error: Is the Next.js server running on port 3000?')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id])

  return (
    <Stack space={3}>
      <Card padding={3} border radius={2} tone={status === 'processed' ? 'positive' : 'default'}>
        <Stack space={3}>
          <Flex justify="space-between" align="center">
            <Box>
              <Text weight="bold" size={1}>Workflow Actions</Text>
              <Box marginTop={2}>
                <Text size={1} color="muted">
                  Status: <Badge tone={status === 'processed' ? 'positive' : 'caution'}>{status || 'draft'}</Badge>
                </Text>
              </Box>
              {dropboxPath && (
                <Box marginTop={2}>
                  <Text size={1} color="muted">
                    Archived: <code style={{ fontSize: '0.8rem' }}>{dropboxPath}</code>
                  </Text>
                </Box>
              )}
            </Box>
            <Flex gap={2}>
              {status === 'processed' && (
                <Button
                  text="View in Dropbox"
                  mode="ghost"
                  onClick={() => window.open('https://www.dropbox.com/home/Apps/Halle5', '_blank')}
                />
              )}
              <Button
                text={loading ? 'Processing...' : 'Generate & Send Receipt'}
                tone="primary"
                disabled={loading || status === 'processed'}
                onClick={processReceipt}
              />
            </Flex>
          </Flex>
          {message && (
            <Text size={1} weight="medium" color={message.startsWith('Error') ? 'critical' : 'positive'}>
              {message}
            </Text>
          )}
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}

export default defineType({
  name: 'accountingReceipt',
  title: 'Accounting Receipt',
  type: 'document',
  fields: [
    defineField({
      name: 'receiptNumber',
      title: 'Receipt Number',
      type: 'string',
      placeholder: 'e.g. 20250001',
      initialValue: () => `${new Date().getFullYear()}0000`,
      validation: (Rule) => Rule.required(),
      components: {
        input: ReceiptActions // Render the action button above this field
      }
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Processed (Sent & Archived)', value: 'processed' }
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      readOnly: true
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString().split('T')[0]
    }),
    defineField({
      name: 'recipient',
      title: 'Recipient',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Name/Company' }),
        defineField({ name: 'email', type: 'string', title: 'Email Address' }),
        defineField({ name: 'address', type: 'text', title: 'Address', rows: 3 }),
      ]
    }),
    defineField({
      name: 'items',
      title: 'Line Items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'description', type: 'string', title: 'Description' }),
          defineField({ name: 'amount', type: 'number', title: 'Amount (€)' }),
          defineField({ name: 'taxRate', type: 'number', title: 'Tax Rate (%)', initialValue: 0 }),
        ],
        preview: {
          select: {
            title: 'description',
            amount: 'amount',
            tax: 'taxRate'
          },
          prepare({ title, amount, tax }) {
            return {
              title: title || 'Item',
              subtitle: `€${amount} (${tax}% VAT)`
            }
          }
        }
      }]
    }),
    defineField({
      name: 'notes',
      title: 'Notes / Footer',
      type: 'text',
      rows: 2
    }),
    defineField({
      name: 'dropboxPath',
      title: 'Dropbox Archive Path',
      type: 'string',
      readOnly: true
    })
  ],
  preview: {
    select: {
      title: 'receiptNumber',
      subtitle: 'recipient.name',
      status: 'status'
    },
    prepare({ title, subtitle, status }) {
      return {
        title: `Receipt #${title}`,
        subtitle: `${subtitle || 'Unknown'} [${status}]`
      }
    }
  }
})
