import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
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

export const getEventsByUserId = async (userId) => {
  try {
    userId = 'taylorfs@icloud.com';

    console.log("Currently grabbing the events using DYNAMO!");
    // Get credentials from Amplify auth session
    const session = await fetchAuthSession()
    
    // Update client with credentials
    const authenticatedClient = new DynamoDBClient({
      region: REGION,
      credentials: session.credentials
    })
    const authenticatedDocClient = DynamoDBDocumentClient.from(authenticatedClient)

    // Query events by client_id (partition key)
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'client_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })

    console.log("Beginning FETCH!");

    const response = await authenticatedDocClient.send(command)

    console.log(response);

    // Group items by event (client events vs vendor quotes)
    const eventsMap = new Map()
    
    response.Items.forEach(item => {
      // Extract event name by removing vendor email from event_id_vendor_id
      // Format: "event-name-vendor@email.com" -> "event-name"
      let eventId = item.event_id_vendor_id
      
      if (item.vendor_email) {
        // Remove the vendor email from the end
        eventId = item.event_id_vendor_id.replace(`-${item.vendor_email}`, '')
      }
      
      // Check if this is a vendor quote (has vendor_name) or client event
      if (item.vendor_name) {
        // This is a vendor quote
        if (!eventsMap.has(eventId)) {
          eventsMap.set(eventId, {
            id: eventId,
            name: eventId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'event',
            quotes: []
          })
        }
        eventsMap.get(eventId).quotes.push({
          id: item.event_id_vendor_id,
          vendorName: item.vendor_name,
          vendorEmail: item.vendor_email,
          serviceCategory: item.service_category,
          serviceDetails: item.service_details,
          quotedPrice: item.quoted_price,
          status: item.status,
          statusExtra: item.status_extra,
          qualityScore: item.quality_score,
          startDate: item.start_date,
          lastReceivedDate: item.last_received_date,
          criteria: typeof item.criteria === 'string' ? JSON.parse(item.criteria) : item.criteria
        })
      } else {
        // This is a client event
        if (!eventsMap.has(eventId)) {
          eventsMap.set(eventId, {
            id: eventId,
            name: item.eventTypeDetails || item.eventType || 'Unnamed Event',
            type: item.eventType || 'unknown',
            date: item.criteria?.Date || item.createdAt,
            budget: item.criteria?.Budget,
            guests: item.criteria?.Capacity,
            services: item.criteria?.LocationService || [],
            additionalInfo: item.criteria?.desc,
            createdAt: item.createdAt,
            quotes: []
          })
        }
      }
    })

    const events = Array.from(eventsMap.values())

    return { success: true, events }
  } catch (error) {
    console.error('Error fetching events from DynamoDB:', error)
    throw error
  }
}
