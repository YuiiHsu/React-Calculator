import style from './App.module.css';
import { useRef, useState } from 'react';

function App() {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', '.'];
  const operators =
  {
    into: '÷',
    times: '×',
    add: '+',
    from: '-',
    equal: '='
  };
  const errorMsg = {
    Infinity: 'Infinity',
    Error: 'Error'
  }

  // 當前總結果
  const result = useRef(0);
  const isTotal = useRef(true);
  // 過程紀錄
  let [process, setProcess] = useState('');
  // 當前動作
  let operator = useRef(operators.add);
  // 當前顯示
  const [currentNumber, setCurrentNumber] = useState('0');

  /**
   * 使用者點擊數字或.按鍵
   * @param {*} currentNum 當前數字
   * @param {*} clickedNum 被點擊的數字
   */
  const handleNumberClicked = (e) => {
    const clickedNum = handleInputSource(e);
    if (isCurrentError() || !clickedNum) return;
    const isContaonDots =
      currentNumber
        .toString()
        .indexOf('.') !== -1 && clickedNum === '.';

    // 僅能包含一個 .
    if (isContaonDots) return;

    // 開頭為0時，不得再輸入0
    const isInputZero = clickedNum === '0' || clickedNum === '00';
    const isFirstZero = currentNumber.length === 1 && currentNumber === '0';
    if (isFirstZero && isInputZero) return;
    if (operator.current === operators.equal) {
      reCalculator();
    }

    // 判斷文字是否合法
    const num = currentNumber
      && ((isFirstZero && clickedNum === '.') || !isFirstZero)
      && (!isTotal.current || (isTotal.current && clickedNum === '.'))
      ? currentNumber.concat(clickedNum) : clickedNum;
    settingNumberAndSize(num);
    isTotal.current = false;
  }

  /**
   * 計算當前數字文字大小或改用科學記號
   * @param {*} currentNum 當前數字
   */
  const settingNumberAndSize = (currentNum) => {
    if (!currentNum || currentNum.length < 10) {
      setCurrentNumber(currentNum);
      return;
    }

    // 換算後小於28px時，改用科學符號記號
    const size = 560 / currentNum.length;
    if (size > 28) {
      document.getElementById("result").style.fontSize = `${size}px`;
      setCurrentNumber(currentNum);
    }
    else {
      const num = Number.parseFloat(currentNum).toExponential(10);
      setCurrentNumber(num);
    }
  }

  /**
   * process超過一定長度時，改成xxx ... xxx顯示
   * @param {*} text 
   */
  const settingProcessSize = (text) => {
    let result = text ? text : '';
    const length = text.length;
    if (length > 35) {
      result = `${text.slice(0, 5)} ... ${text.slice(length - 5, length)}`
    }

    setProcess(result);
  }

  /**
   * 來自鍵盤或滑鼠點擊的動作
   */
  const handleInputSource = (input) => {
    return input.target ? input.target.innerText : input;
  }

  /**
   * 點擊AC鍵後，重置計算機
   */
  const reset = () => {
    settingNumberAndSize('0')
    settingProcessSize('');
    result.current = 0;
    document.getElementById("result").style.fontSize = '56px';
  }

  /**
   * 刪除一個字元
   */
  const remove = () => {
    if (isCurrentError() || !currentNumber) return;

    if (currentNumber.length > 1) {
      settingNumberAndSize(currentNumber.slice(0, -1));
    }
    else {
      settingNumberAndSize('0');
    }
  }

  /**
   * 確認當前顯示文字是不是錯誤訊息
   * @returns 當前顯示文字是不是錯誤訊息
   */
  const isCurrentError = () => {
    return Object.values(errorMsg).includes(currentNumber);
  }

  /**
   * 加上千分位
   * @param {*} inputText 欲改成千分位顯示的字串
   * @returns 千分位格式字串
   */
  const commaFormat = (inputNum) => {
    if (!inputNum) return;

    return inputNum.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * 處理加減乘除及等號
   * @param {*} e 動作
   */
  const handleOperatorAction = (e) => {
    if (isCurrentError()) return;
    const action = handleInputSource(e);
    // 改運算符號
    if (process && isTotal.current) {
      settingProcessSize(`${process.slice(0, -1)} ${action}`);
      operator.current = action;
      return;
    }

    const currentNum = currentNumber ? Number.parseFloat(currentNumber) : 0;
    switch (operator.current) {
      case operators.add:
        result.current = result.current + currentNum;
        break;
      case operators.from:
        result.current = result.current - currentNum;
        break;
      case operators.into:
        if (currentNumber === '0' && result.current === 0) {
          settingNumberAndSize(errorMsg.Error);
          return;
        }
        result.current = result.current / currentNum;
        break;
      case operators.times:
        result.current = result.current * currentNum;
        break;
      default:
        break;
    }

    settingProcessSize(operator.current === operators.equal
      ? `${currentNumber} ${action}`
      : `${process} ${currentNumber} ${action}`);
    operator.current = action;
    settingNumberAndSize(result.current.toString());
    isTotal.current = true;
  }

  // 按了等於後，再重新計算
  const reCalculator = () => {
    result.current = 0;
    settingProcessSize('');
    operator.current = operators.add;
  }

  // 監聽鍵盤輸入
  document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (!e) return;
    if (e.keyCode === 8) {
      remove();
    } else if (e.keyCode === 187 && event.shiftKey) {
      handleOperatorAction(operators.add);
    } else if (e.keyCode === 13 || e.keyCode === 187) {
      handleOperatorAction(operators.equal);
    } else if (e.keyCode === 189 && event.shiftKey) {
      handleOperatorAction(operators.from);
    } else if (e.keyCode === 56 && event.shiftKey) {
      handleOperatorAction(operators.times);
      return;
    } else if (e.keyCode === 191) {
      handleOperatorAction(operators.into);
    }
    else if (e.keyCode === 48) {
      handleNumberClicked('0')
    } else if (e.keyCode === 49) {
      handleNumberClicked('1')
    } else if (e.keyCode === 50) {
      handleNumberClicked('2')
    } else if (e.keyCode === 51) {
      handleNumberClicked('3')
    } else if (e.keyCode === 52) {
      handleNumberClicked('4')
    } else if (e.keyCode === 53) {
      handleNumberClicked('5')
    } else if (e.keyCode === 54) {
      handleNumberClicked('6')
    } else if (e.keyCode === 55) {
      handleNumberClicked('7')
    } else if (e.keyCode === 56) {
      handleNumberClicked('8')
    } else if (e.keyCode === 57) {
      handleNumberClicked('9')
    }
  }

  return (
    <div className={style.App}>
      <div className={style.container}>
        {/* 顯示輸入資訊 */}
        <div className={style.inputShow}>
          <div id="process" className={style.process}>
            {process}
          </div>
          <div id="result" className={style.result}>
            {commaFormat(currentNumber)}
          </div>
        </div>
        {/* 數字按鍵區 */}
        <div className={style.numberArea}>
          {numbers
            .map(num => <div
              key={num}
              className={style.numberBtn}
              onClick={handleNumberClicked}>
              {num}
            </div>
            )}
        </div>

        {/* 加減乘除按鍵區 */}
        <div className={style.operatorArea}>
          {
            Object.values(operators)
              .filter(o => o !== operators.equal)
              .map(operator => <div
                key={operator}
                className={style.operatorBtn}
                onClick={handleOperatorAction}>
                {operator}
              </div>
              )}
        </div>

        {/* 歸零、等於、刪除按鍵區 */}
        <div className={style.buttonArea}>
          <div className={style.actionBtn} onClick={reset}>
            AC
          </div>
          <div className={style.actionBtn} onClick={remove}>
            ⌫
          </div>
          <div className={style.enterBtn} onClick={handleOperatorAction}>
            <div className={style.text}>
              =
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
