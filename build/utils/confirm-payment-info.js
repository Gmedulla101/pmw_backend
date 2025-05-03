"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendPaymentConfimrationEmail = (email, buyer, cost, item) => {
    return {
        from: 'grobartig.inc@gmail.com',
        to: email,
        subject: 'Payment confirmation',
        html: `<main
      style="
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
          'Lucida Sans', Arial, sans-serif;
      "
    >
      <div
        style="
          background-color: black;
          color: white;
          padding: 10px;
          margin-bottom: 40px;
        "
      >
        <h1 style="text-align: center">Payway</h1>
      </div>

      <div style="text-align: center">
        <p>
         ${buyer} has made a payment of ${cost} for ${item}. You can go ahead and deliver it.
        </p>
        <p> Ensure to confirm the delivery on Payway to avoid loss of funds and inconsistencies in your transaction. </p>
        </div>
      </div>
    </main>
`,
    };
};
exports.default = sendPaymentConfimrationEmail;
//# sourceMappingURL=confirm-payment-info.js.map