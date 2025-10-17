import React from 'react'
import { useEffect, useState } from 'react';
import "prismjs/themes/prism-tomorrow.css";

import Prism, { highlight } from "prismjs";
import './App.css'

function App() {

  // Used prism highlighting on code blocks:-
  useEffect(() => {
    Prism.highlightAll();
  })

  return (
    <>
    <main>
      <div className="left">
        <div className="code">
          <pre>
            <div className="javascript-language">
              {`function sum (){
              return 2 + 2}`}
            </div>
            </pre>
        </div>
        <div className="review">Review</div>
      </div>
      <div className="right"></div>
    </main>
    </>
  )
}


export default App
