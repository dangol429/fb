import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    .ant-card .ant-card-meta-detail > div:not(:last-child) {
        margin-bottom: 0px !important;
        margin-left: 4rem; /* or your desired value */
    }
    .ant-card-meta-avatar {
        position: absolute;
    }
    .sc-gyUexO kmAaRJ{
        width: 600px !important;
    }

    .ant-layout-sider-children{
        background-color: white;
    }
    @media (max-width: 600px) {
        .ant-card-body {
            padding:5px !important;
            padding-bottom:15px !important;
        }
    }
`;
