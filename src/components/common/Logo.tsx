
import LogoImage from '../../assets/logo.png'

interface LogoProps {
  width?: number;
  height?: number;
}
const Logo: React.FC<LogoProps> = ({ width, height }) => {
  return (
    <img src={LogoImage} alt="" width={width} height={height} />
  );
};

export default Logo;
