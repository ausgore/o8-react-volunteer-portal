//to use in future, has bugs

// import React, { useEffect, useState } from 'react';
// import { IoMdClose } from 'react-icons/io';
// import ProgressBar from 'progressbar.js';

// interface ProgressAlertProps {
//   message: string;
//   show: boolean;
//   onClose: () => void;
//   success: boolean;
// }

// export default function ProgressAlert(props: ProgressAlertProps) {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     let interval2: NodeJS.Timeout;
//     let hideTimeout: NodeJS.Timeout;
//     let slideUpTimeout: NodeJS.Timeout;

//     if (props.show) {
//       setIsVisible(true);

//       const color = props.success ? '#28a745' : '#dc3545'; // Green for success, Red for failure
//       const trailColor = props.success ? '#d4edda' : '#f8d7da'; // Lighter green or red for trail

//       const bar = new ProgressBar.Circle('#progress-container', {
//         strokeWidth: 5,
//         easing: 'easeInOutExpo',
//         duration: 3000, // 3 seconds duration
//         color: color, // Color for progress bar
//         trailColor: trailColor, // Trail color
//         trailWidth: 5,
//         svgStyle: null,
//         from: { color: color, width: 5 },
//         to: { color: color, width: 5 },
//         step: function (state, circle) {
//           circle.path.setAttribute('stroke', state.color);
//           circle.path.setAttribute('stroke-width', state.width);
//           const value = Math.round(circle.value() * 100);
//           if (value === 0) {
//             circle.setText('');
//           } else {
//             circle.setText(value.toString());
//           }
//         },
//       });

//       bar.text.style.color = 'transparent';
//       bar.animate(1.0); // Start the animation

//       interval2 = setInterval(() => {
//         const progressBarText = document.querySelector('div.progressbar-text');
//         if (progressBarText && progressBarText.textContent === '100') {
//           clearInterval(interval2);
//           const whiteCircle = document.querySelector('div#whitecircle div');
//           if (whiteCircle) {
//             whiteCircle.style.transition = 'width 0.333s, height 0.333s';
//             whiteCircle.style.width = '0';
//             whiteCircle.style.height = '0';
//           }

//           setTimeout(() => {
//             const tick = document.querySelector('div#tick div');
//             if (tick) {
//               tick.style.transition = 'font-size 0.333s';
//               tick.style.fontSize = '40px'; // Smaller tick or X size
//             }
//           }, 333);
//         }
//       }, 100);

//       hideTimeout = setTimeout(() => {
//         setIsVisible(false);
//         slideUpTimeout = setTimeout(props.onClose, 500);
//       }, 3500); // 3000ms for progress bar + 500ms for sliding up
//     } else {
//       hideTimeout = setTimeout(() => {
//         setIsVisible(false);
//         slideUpTimeout = setTimeout(props.onClose, 500);
//       }, 500); // Match the duration of the transition
//     }

//     return () => {
//       clearInterval(interval2);
//       clearTimeout(hideTimeout);
//       clearTimeout(slideUpTimeout);
//     };
//   }, [props.show, props.success, props.onClose]);

//   if (!isVisible && !props.show) return null;

//   return (
//     <div
//       className={`fixed top-0 inset-x-0 flex items-center justify-center z-50 transition-transform duration-500 transform ${props.show ? 'translate-y-0' : '-translate-y-full'
//         } mt-8`}
//     >
//       <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-lg">
//         <button
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//           onClick={() => {
//             setIsVisible(false);
//             setTimeout(props.onClose, 500);
//           }}
//         >
//           <IoMdClose size={24} />
//         </button>
//         <div className="text-center">
//           <div id="progress-container" className="relative w-[6rem] h-[6rem] mx-auto">
//             <div id="bkground" className="flex items-center justify-center absolute w-full h-full">
//               <div className={`w-[5rem] h-[5rem] rounded-full ${props.success ? 'bg-green-300' : 'bg-red-300'}`}></div>
//             </div>
//             <div id="whitecircle" className="flex items-center justify-center absolute w-full h-full">
//               <div className="w-[5rem] h-[5rem] bg-white rounded-full"></div>
//             </div>
//             <div id="tick" className="flex items-center justify-center absolute w-full h-full">
//               <div className={`font-bold text-0 ${props.success ? 'text-green-200' : 'text-red-200'}`}>{props.success ? '✔' : '✖'}</div>
//             </div>
//           </div>
//           <h2 className="text-2xl font-semibold mt-4">{props.message}</h2>
//         </div>
//       </div>
//     </div>
//   );
// }
