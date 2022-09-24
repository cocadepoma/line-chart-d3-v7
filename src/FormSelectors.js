import React from 'react'

export const FormSelectors = ({
  updateData,
  options,
  formData,
  setFormData,
  availableDates,
}) => {
  const onSelectChange = ({ target }) => {
    const coinToSet = target.name === "coin"
      ? target.value
      : formData.coin;

    if (target.name === 'var') {
      changeLabelText(target.value)
    }

    setFormData({
      ...formData,
      [target.name]: target.value,
      minDate: new Date(availableDates[coinToSet].at(0)).toISOString().slice(0, 10),
      maxDate: new Date(availableDates[coinToSet].at(-1)).toISOString().slice(0, 10)
    });
  };

  const onDateChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: new Date(target.value).toISOString().slice(0, 10),
    });
    updateData(target);
  };

  const changeLabelText = (value) => {
    const newText = (value === "price_usd")
      ? "Price ($)"
      : (value === "market_cap")
        ? "Market Capitalization ($)"
        : "24 Hour Trading Volume ($)"

    options.labelsText = { ...options.labelsText, yAxis: newText };
  };
  return (
    <div>
      <div className="form__selects--container">
        <div className="form__select--container">
          <label>Cryptocoin:</label>
          <select
            id="coin-select"
            className="form-control"
            onChange={onSelectChange}
            name="coin"
            value={formData.coin}
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="bitcoin_cash">Bitcoin Cash</option>
            <option value="litecoin">Litecoin</option>
            <option value="ripple">Ripple</option>
          </select>
        </div>

        <div className="form__select--container">
          <label>Value:</label>
          <select
            id="var-select"
            className="form-control"
            onChange={onSelectChange}
            name="var"
            value={formData.var}
          >
            <option value="price_usd">Price in dollars</option>
            <option value="market_cap">Market capitalization</option>
            <option value="24h_vol">24 hour trading volume</option>
          </select>
        </div>
      </div>



      <br />
      {
        availableDates[formData.coin]?.length > 0 && (

          <div className="form__selects--container">
            <div className="form__select--container">
              <label>From: </label>
              <input
                value={formData.minDate}
                type="date"
                name="minDate"
                min={new Date(availableDates[formData.coin].at(0)).toISOString().slice(0, 10)}
                max={formData.maxDate}
                onChange={onDateChange}
              />
            </div>

            <div className="form__select--container">
              <label>To: </label>
              <input
                value={formData.maxDate}
                type="date"
                name="maxDate"
                min={formData.minDate}
                max={new Date(availableDates[formData.coin].at(-1)).toISOString().slice(0, 10)}
                onChange={onDateChange}
              />
            </div>
          </div>
        )
      }
      <br />
    </div>
  )
}
