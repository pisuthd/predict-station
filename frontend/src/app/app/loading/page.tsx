'use client'

import { useRouter } from 'next/navigation'
import LoadingScreen from '../../../pages/LoadingScreen'

export default function LoadingPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/app/agent')
  }

  return <LoadingScreen onComplete={handleComplete} />
}