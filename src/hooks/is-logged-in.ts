import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { isAuthenticated } from 'api/auth'

function useIsLoggedIn(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    isAuthenticated().then(setIsLoggedIn)
  }, [])

  return [isLoggedIn, setIsLoggedIn]
}

export default useIsLoggedIn
