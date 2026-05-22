import { CYAN, monoFont } from '../theme'

export default function Wordmark({ fontSize = 20 }: { fontSize?: number }) {
  return (
    <p style={{ 
      fontFamily: monoFont, 
      fontWeight: 700, 
      fontSize, 
      letterSpacing: '0.06em', 
      color: CYAN, 
      margin: 0 
    }}>
      <span style={{ color: '#fff' }}>Predict</span> Station
    </p>
  )
}