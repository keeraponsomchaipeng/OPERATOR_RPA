'use client'
import React, { useState } from 'react';

export default function App() {
  const [value, setValue] = useState("b");

  function logValue() {
    console.log(value);
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      >
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
        <option value="d">d</option>
      </select>

      <button onClick={logValue}>submit</button>
    </div>
  );
}
