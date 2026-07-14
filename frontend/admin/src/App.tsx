import { useState, useEffect } from 'react'
import type {Dispatch, SetActionState} from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'


function App() {
  return (
    <></>
  );
}

function AppWrapper(){
  return (
    <Router basename = '/admin'>
      <App/>
    </Router>
  )
}


export default AppWrapper