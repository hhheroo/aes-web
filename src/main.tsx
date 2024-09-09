import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Aes from 'crypto-js/aes';
import HmacSha256 from 'crypto-js/hmac-sha256';
import EncBase64 from 'crypto-js/enc-base64';
import EncUtf8 from 'crypto-js/enc-utf8';
import WordArray from 'crypto-js/lib-typedarrays';
import { Button, Input, Typography, Cell, Toast } from 'react-vant';
import { ClosedEye, EyeO } from '@react-vant/icons';
import CodeEditor from '@uiw/react-textarea-code-editor';
import './main.css';
import './globals';
import { useBrowserActive } from './hooks';

function createAesKey() {
  return EncBase64.stringify(WordArray.random(1024));
}

function downloadFile(data: string, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
  link.download = filename;
  link.click();
}

function App() {
  const browserActive = useBrowserActive();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const $file = useRef<HTMLInputElement>(null);
  const crypto = useRef({
    keys: '',
    hmac: '',
    content: ''
  });

  useEffect(() => {
    if (!browserActive) {
      setContent('');
    }
  }, [browserActive]);

  function onCreateKeyBtnClick() {
    const aesKeys = createAesKey();
    console.log(aesKeys);
    downloadFile(aesKeys, 'aes.key');
  }

  async function onLoadKeysBtnClick() {
    if (!$file.current) return;
    $file.current.click();

    await Promise.fromEvent('onchange', $file.current);

    const reader = new FileReader();
    const readerPromise = Promise.fromEvent(
      'onload',
      reader,
      (e: ProgressEvent<FileReader>) => e.target!.result as string
    );

    reader.readAsText($file.current.files![0]);
    crypto.current.content = await readerPromise;
  }

  async function onLoadFileBtnClick() {
    if (!$file.current) return;
    $file.current.click();

    await Promise.fromEvent('onchange', $file.current);

    const reader = new FileReader();
    const readerPromise = Promise.fromEvent(
      'onload',
      reader,
      (e: ProgressEvent<FileReader>) => e.target!.result as string
    );

    reader.readAsText($file.current.files![0]);
    crypto.current.content = await readerPromise;
  }

  function decrypt() {
    const hmac = HmacSha256(password, crypto.current.keys).toString();
    crypto.current.hmac = hmac;
    try {
      return Aes.decrypt(
        crypto.current.content,
        `${crypto.current.keys.slice(0, 20)}${btoa(
          crypto.current.hmac
        )}${crypto.current.keys.slice(20)}`
      ).toString(EncUtf8);
    } catch (e) {
      Toast.fail({
        message: `解密失败\n${String(e)}`
      });
      return '';
    }
  }

  function encrypt(data: string) {
    const hmac = HmacSha256(password, crypto.current.keys).toString();
    crypto.current.hmac = hmac;

    const encStr = Aes.encrypt(
      data,
      `${crypto.current.keys.slice(0, 20)}${btoa(
        crypto.current.hmac
      )}${crypto.current.keys.slice(20)}`
    ).toString();

    return (crypto.current.content = encStr);
  }

  function onDecryptBtnClick() {
    const decryptedContent = decrypt();
    setContent(decryptedContent);
  }

  function onEncryptBtnClick() {
    downloadFile(encrypt(content), 'data.enc');
  }

  function onTogglePasswordShowBtnClick() {
    setShowPassword(val => !val);
  }

  const ShowPasswordBtn = showPassword ? (
    <EyeO onClick={onTogglePasswordShowBtnClick} />
  ) : (
    <ClosedEye onClick={onTogglePasswordShowBtnClick} />
  );

  return (
    <>
      <Cell>
        <Button block onClick={onCreateKeyBtnClick} type="primary" round>
          创建密钥
        </Button>
      </Cell>
      <Cell>
        <Button block onClick={onLoadKeysBtnClick} type="primary" round>
          加载密钥
        </Button>
      </Cell>
      <Cell>
        <Button block onClick={onLoadFileBtnClick} type="primary" round>
          加载加密文件
        </Button>
      </Cell>
      <Cell>
        <Button block onClick={onDecryptBtnClick} type="primary" round>
          解密
        </Button>
      </Cell>
      <Cell>
        <Button block onClick={onEncryptBtnClick} type="primary" round>
          加密
        </Button>
      </Cell>
      <Cell>
        <Input
          placeholder="密码"
          clearable
          value={password}
          onChange={setPassword}
          type={showPassword ? 'text' : 'password'}
          suffix={ShowPasswordBtn}
        />
      </Cell>

      <Typography.Title>内容</Typography.Title>

      <Cell>
        <CodeEditor
          language="markdown"
          value={content}
          onChange={evn => setContent(evn.target.value)}
        />
      </Cell>
      <input type="file" style={{ display: 'none' }} ref={$file} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
