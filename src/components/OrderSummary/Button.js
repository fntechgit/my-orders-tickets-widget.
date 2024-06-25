import { Button } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)({
  width: '100%',
  color: '#000000',
  display: 'inline-block',
  border: '1px solid #000000',
  margin: '15px 0 0',
  fontSize: '1.3em',
  padding: '10px'
})

const OrderSummaryButton = ({ children, onClick }) => {
  return (
    <StyledButton variant='outlined' onClick={onClick}>
      {children}
    </StyledButton>
  )
}

export default OrderSummaryButton
