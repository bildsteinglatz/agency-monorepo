import { defineType, defineField, useFormValue, InputProps } from 'sanity'
import React, { useState, useCallback } from 'react'
import { Stack, Card, Text, TextArea, Button, Box, Flex, TextInput } from '@sanity/ui'

function HTMLPreview(props: InputProps) {
  const body = useFormValue(['body']) as string
  const slug = useFormValue(['slug']) as any
  
  const [testEmail, setTestEmail] = useState('')
  const [status, setStatus] = useState('')

  const sendTest = useCallback(async () => {
    if (!testEmail) return alert('Please enter an email address')
    if (!slug?.current) return alert('Please save the document first (slug is missing)')
    
    setStatus('Sending...')
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
      const res = await fetch(`${baseUrl}/api/email/send-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.current,
          to: testEmail,
          data: {
            userName: 'Test User',
            workshopTitle: 'Test Workshop',
            workshopDate: '01.01.2025',
            membershipType: 'Test Membership'
          }
        })
      })
      if (res.ok) setStatus('Sent!')
      else setStatus('Error sending')
    } catch (e) {
      setStatus('Error')
    }
  }, [testEmail, slug])

  return (
    <Stack space={4}>
      {/* Render the default input if you want to see the field value, 
          but since this is a preview field, we can just show our custom UI */}
      
      <Card padding={3} border radius={2}>
        <Stack space={3}>
          <Text size={1} weight="bold" color="muted">PREVIEW:</Text>
          {body ? (
            <Box 
              style={{ 
                padding: '1em', 
                border: '1px solid #eee', 
                background: 'white',
                minHeight: '100px',
                color: 'black'
              }}
              dangerouslySetInnerHTML={{ __html: body }} 
            />
          ) : (
            <Text size={1} color="muted">No content to preview</Text>
          )}
        </Stack>
      </Card>

      <Card padding={3} border radius={2} tone="transparent">
        <Stack space={3}>
          <Text size={1} weight="bold" color="muted">SEND TEST EMAIL:</Text>
          <Flex gap={2}>
            <Box flex={1}>
              <TextInput 
                type="email" 
                placeholder="your@email.com" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.currentTarget.value)}
              />
            </Box>
            <Button 
              text="Send Test" 
              tone="primary" 
              onClick={sendTest}
              disabled={!testEmail || status === 'Sending...'}
            />
          </Flex>
          {status && <Text size={1}>{status}</Text>}
        </Stack>
      </Card>
    </Stack>
  )
}

export default defineType({
  name: 'emailTemplate',
  title: 'Email Template',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Template Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject Line',
      type: 'string',
      description: 'Placeholders: {{userName}}, {{workshopTitle}}, {{workshopDate}}',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body Text (HTML)',
      type: 'text',
      description: 'HTML content. Placeholders: {{userName}}, {{workshopTitle}}, {{workshopDate}}',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'preview',
      title: 'HTML Preview',
      type: 'string',
      components: {
        input: HTMLPreview
      }
    })
  ],
})
