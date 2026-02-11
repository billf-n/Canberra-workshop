import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'
import { v4 as uuidv4 } from 'uuid'

const REGION = import.meta.env.VITE_AWS_REGION || 'ap-southeast-2'
const TABLE_NAME = import.meta.env.VITE_DYNAMODB_TABLE_NAME || 'test-2'

// Create DynamoDB client
const client = new DynamoDBClient({ region: REGION })
const docClient = DynamoDBDocumentClient.from(client)

export const saveEventToDatabase = async (eventData, userId) => {
  try {
    // Get credentials from Amplify auth session
    const session = await fetchAuthSession()
    
    // Update client with credentials
    const authenticatedClient = new DynamoDBClient({
      region: REGION,
      credentials: session.credentials
    })
    const authenticatedDocClient = DynamoDBDocumentClient.from(authenticatedClient)

    // Generate event ID
    const eventId = uuidv4()

    // Build criteria object from form data
    const criteria = {
      LocationService: eventData.services || [],
      desc: eventData.additionalInfo || '',
      Date: eventData.eventDate || '',
      Capacity: eventData.guests ? parseInt(eventData.guests) : 0,
      Budget: eventData.budget || null,
      Distance: eventData.distance || null,
      AmountOfService: eventData.services ? eventData.services.length : 0
    }

    // Prepare item for DynamoDB
    const item = {
      client_id: userId,
      event_id_vendor_id: eventId,
      criteria: criteria,
      eventType: eventData.eventType || '',
      eventTypeDetails: eventData.eventTypeDetails || '',
      createdAt: new Date().toISOString()
    }

    // Save to DynamoDB
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })

    await authenticatedDocClient.send(command)

    return { success: true, eventId }
  } catch (error) {
    console.error('Error saving to DynamoDB:', error)
    throw error
  }
}
