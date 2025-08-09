import React, { useEffect, useRef } from 'react';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/yonce.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import CodeMirror from "codemirror";

const Console = ({ socketRef, roomId, onCodeChange }) => {
  const cmInstance = useRef(null);     // Ref to CodeMirror instance

  useEffect(() => {
    const init = async () => {
      if (!cmInstance.current) return;

      // Create CodeMirror instance
      const editor = CodeMirror.fromTextArea(

        document.getElementById("rt-editor"), {

          mode: { name: "javascript", json: true },
          theme: "yonce",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
      });

      cmInstance.current = editor;

      // Set size
      cmInstance.current.setSize(null, "100%");

      // Apply wrapper styles
      const cmElement = cmInstance.current.getWrapperElement();
      cmElement.style.borderRadius = '12px';
      cmElement.style.overflow = 'hidden';
      cmElement.style.backgroundColor = '#1B1D23';

      const gutters = cmElement.querySelector('.CodeMirror-gutters');
      if (gutters) {
        gutters.style.borderTopLeftRadius = '12px';
        gutters.style.borderBottomLeftRadius = '12px';
        gutters.style.overflow = 'hidden';
      }

      // Add change event listener
      cmInstance.current.on('change', (instance, changes) => {
        // console.log('changes', instance.getValue(), changes);
        
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);

        if(origin !== 'setValue'){
          socketRef.current.emit('code-change', {
            roomId, 
            code
          })
        }
      });
    };

    init();
  }, []);


  useEffect(() => {
    let initialLoad = true;

    if (socketRef.current) {
      socketRef.current.on('code-change', ({ code, username }) => {
        if (cmInstance.current) {
          if(initialLoad){
            cmInstance.current.setValue(code);
            initialLoad = false;
            return;
          }
          cmInstance.current.setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('code-change');
      }
    };
  }, [socketRef.current]); 



  return (
    <div className="h-full w-full p-4">
      <textarea id="rt-editor" ref={cmInstance} />
    </div>
  );
}

export default Console;
