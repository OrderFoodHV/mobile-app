import HeaderApp from "@app-components/HeaderApp/HeaderApp"
import { Container, Content } from "@app-layout/Layout"
import { View } from "react-native"

interface NotificationProps {}
const Notification:React.FC<NotificationProps> = () => {
  return (
    <Container>
    <HeaderApp title="Cá nhân" />
  <Content>
    <View>

    </View>
  </Content>
 </Container>
  )
}
export default Notification