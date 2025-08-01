
//Node Js api

const NODE_API_HOST = 'http://15.206.121.90:1624'

export interface HistoryApiRequest {
  history_name: string
  user_id: number
  session_id: string
  history_date: string
  history_map: Array<{ Prompt?: string; [key: string]: any }>
  is_active: boolean
}

export interface HistoryApiResponse {
  success: boolean
  statusCode: string
  msg: string
  data: {
    history: string[]
    historyMap: Record<string, any>
  }
}

// Save history to backend
export const saveHistoryToBackend = async (historyData: HistoryApiRequest): Promise<void> => {
  try {
    const response = await fetch(`${NODE_API_HOST}/api/v1/history-ui`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyData)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to save history: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error saving history to backend:', error)
    throw error
  }
}

// Fetch history from backend
export const fetchHistoryFromBackend = async (userId: number = 1): Promise<HistoryApiResponse['data']> => {
  try {
    const response = await fetch(`${NODE_API_HOST}/api/v1/history-map?user_id=${userId}&is_active=true`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`)
    }
    
    const data: HistoryApiResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.msg || 'Failed to fetch history')
    }
    
    return data.data
  } catch (error) {
    console.error('Error fetching history from backend:', error)
    throw error
  }
}

// Delete history from backend
export const deleteHistoryFromBackend = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`${NODE_API_HOST}/api/v1/history-ui`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        is_active: true
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete history: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting history from backend:', error)
    throw error
  }
}