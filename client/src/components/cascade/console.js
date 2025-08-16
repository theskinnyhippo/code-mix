import React, { useEffect, useRef, useState } from 'react';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/yonce.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike"; // C/C++/Java/Go
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import CodeMirror from "codemirror";

const modeMap = {
  'c':         { name: "text/x-csrc" },
  'c++':       { name: "text/x-c++src" },
  'java':      { name: "text/x-java" },
  'javascript':{ name: "javascript", json: true },
  'python':    { name: "python", version: 3 },
  'go':        { name: "text/x-go" },
};

const Console = ({ socketRef, roomId, onCodeChange, language, setLanguage }) => {
  
  const cmEditor  = useRef(null);
  const cmInput   = useRef(null);
  const cmOutput  = useRef(null);

  const createMirror = (id, readOnly = false) => {
    const el = document.getElementById(id);
    if (!el) return;

    const editor = CodeMirror.fromTextArea(el, {
      mode: modeMap[language],
      theme: "yonce",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      readOnly,
    });

    editor.setSize(null, "100%");
    const wrap = editor.getWrapperElement();
    wrap.style.borderRadius = '12px';
    wrap.style.overflow = 'hidden';
    wrap.style.backgroundColor = '#1B1D23';

    const gutters = wrap.querySelector('.CodeMirror-gutters');
    if (gutters) {
      gutters.style.borderTopLeftRadius = '12px';
      gutters.style.borderBottomLeftRadius = '12px';
      gutters.style.overflow = 'hidden';
    }
    return editor;
  };

  /* initialise */
  useEffect(() => {
    cmEditor.current = createMirror("rt-editor");
    cmInput.current  = createMirror("rt-stdin");
    cmOutput.current = createMirror("rt-output", true);


    cmEditor.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);
      if (origin !== 'setValue') {
        socketRef.current?.emit('code-change', { roomId, code });

      }
    });
  }, []);

  /* language change */
  useEffect(() => {
    if (cmEditor.current) cmEditor.current.setOption("mode", modeMap[language]);
  }, [language]);

  /* remote sync */
  useEffect(() => {
    const onRemote = ({ code }) => cmEditor.current?.setValue(code);
    socketRef.current?.on('code-change', onRemote);
    return () => socketRef.current?.off('code-change', onRemote);
  }, [socketRef.current]);


  // handle code submit
const submitCode = async () => {
  const stdin = cmInput.current?.getValue() || '';
  const code  = cmEditor.current?.getValue() || '';

  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/run`, {  //
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      language, 
      code, 
      input : stdin 
    })
  });

  console.log(stdin);
  
  const { output } = await res.json();
  cmOutput.current?.setValue(output ?? ""); 
  
  console.log(output);
};


  return (
    <div className="h-full w-full flex">
      <div className="w-[60%] h-full py-4 pl-4">
        <textarea id="rt-editor" />
      </div>

      <div className="w-[40%] h-full flex flex-col gap-4 p-4">
        <div className="h-[46%]">
          <textarea id="rt-stdin" className='' placeholder="stdin" />
        </div>

        <div className="h-[5%] flex items-center gap-2">
          <button 
            className="h-full w-1/2 px-4 bg-black rounded-lg shadow-sm shadow-white hover:bg-green-950 text-white font-mono font-bold"
            onClick={submitCode}  
          >
            RUN
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-full w-1/2 px-2 bg-black text-white rounded-lg shadow-sm shadow-white font-mono text-sm"
          >
            <option value="c">c</option>
            <option value="c++">c++</option>
            <option value="java">java</option>
            <option value="javascript">javascript</option>
            <option value="python">python</option>
            <option value="go">go</option>
          </select>
        </div>

        <div className="h-[47%]">
          <textarea id="rt-output" placeholder="output" />
        </div>
      </div>
    </div>
  );
};

export default Console;