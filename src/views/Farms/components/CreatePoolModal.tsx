import React, { useCallback, useState, useEffect, Fragment } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useSushi from '../../../hooks/useSushi'
import { getSushiAddress } from '../../../sushi/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import ButtonCustom from './Button'
import CardIcon from '../../../components/CardIcon'
import Label from '../../../components/Label'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalContent from '../../../components/ModalContent'
import ModalTitle from '../../../components/ModalTitle'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import moment from 'moment';

import { Form, Input, Button, Select, Avatar, DatePicker, Space, message, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getTokenInfo } from "../../../utils/contract";
import { debounce, isEmpty } from 'lodash';
import Jazzicon from '../../../components/Jazzicon'

const { RangePicker } = DatePicker;

const { Option } = Select;

const dateFormat = 'YYYY-MM-DD HH:mm';

const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 15 },
};
const tailLayout = {
  wrapperCol: { offset: 7, span: 15 },
};

const CreatePool = () => {
  const [form] = Form.useForm();
  const { account } = useWallet()
  const [avatarSrc, setAvatarSrc] = useState('')
  const defaultValueTime: any = [moment().format('YYYY-MM-DD HH:mm'), moment().day(7).format('YYYY-MM-DD HH:mm')]
  const [stakeTokenInfo, setStakeTokenInfo]: any = useState()
  const [earnTokenInfo, setEarnTokenInfo]: any = useState()

  const onFinish = (values: any) => {
    console.log(values);
    message.success('开始创建');
  };

  function onChangeAvatar() {
    let data = form.getFieldsValue()
    setAvatarSrc(data.cover)
  }

  async function onChangeStakeToken() {
    try {
      let data = form.getFieldsValue()
      console.log('start search stake token info...', data)
      if (String(data.stake).trim()) {
        message.success('正在获取Token信息...');
        const res = await getTokenInfo(data.stake)
        console.log('onChangeStakeToken res', res)
        setStakeTokenInfo(res)
      }
    } catch (e) {
      console.log('onChangeStakeToken res error', e)
      setStakeTokenInfo({})
    }
  }

  async function onChangeEarnToken() {
    try {
      let data = form.getFieldsValue()
      console.log('start search stake token info...', data)
      if (String(data.earn).trim()) {
        message.success('正在获取Token信息...');
        const res = await getTokenInfo(data.earn)
        console.log('onChangeEarnToken res', res)
        setEarnTokenInfo(res)
      }
    } catch (e) {
      console.log('onChangeEarnToken res error', e)
      setEarnTokenInfo({})
    }
  }

  function onChangeStart(date: any, dateString: any) {
    // console.log(date, dateString);
    let data = form.getFieldsValue()
    form.setFieldsValue({
      ...data,
      startTime: dateString
    })
  }
  function onChangeEnd(date: any, dateString: any) {
    // console.log(date, dateString);
    let data = form.getFieldsValue()
    form.setFieldsValue({
      ...data,
      endTime: dateString
    })
  }

  useEffect(() => {
    let data = form.getFieldsValue()
    form.setFieldsValue({
      ...data,
      startTime: defaultValueTime[0],
      endTime: defaultValueTime[1]
    })
  }, [])



  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <StyledBalanceWrapper>
          <CardIcon>
            { avatarSrc ? <Avatar size={64} src={avatarSrc} /> : '' }
          </CardIcon>
        </StyledBalanceWrapper>
      </div>
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="cover" label="Cover" rules={[{ required: true, message: 'Please input your cover url!'  }]}>
          <Input placeholder="Please input you cover" onChange={onChangeAvatar} />
        </Form.Item>
        <Form.Item name="poolName" label="Pool name" rules={[{ required: true, message: 'Please input your pool name!'  }]}>
          <Input placeholder="Please input you pool name" />
        </Form.Item>
        <Form.Item name="stake" label="Stake Token" rules={[{ required: true, message: 'Please input your stake token address!'  }]}>
          <Input placeholder="Please input you stake token address" onChange={onChangeStakeToken} />
        </Form.Item>
        {
          isEmpty(stakeTokenInfo) ? '' : (
            <StyleTokenInfoRow>
              <Row>
                <Col span={layout.labelCol.span}></Col>
                <Col span={layout.wrapperCol.span}>
                  <StyleTokenInfoCol>
                    <Space>
                      <StyleTokenInfoCol>
                        <Jazzicon address={account}></Jazzicon>
                      </StyleTokenInfoCol>
                      <span>{stakeTokenInfo.name}({stakeTokenInfo.symbol})</span>
                      <span>decimals: {stakeTokenInfo.decimals}</span>
                    </Space>
                  </StyleTokenInfoCol>
                </Col>
              </Row>
            </StyleTokenInfoRow>
          )
        }
        <Form.Item name="earn" label="Earn Token" rules={[{ required: true, message: 'Please input your earn token address!'  }]}>
          <Input placeholder="Please input you earn token address" onChange={onChangeEarnToken} />
        </Form.Item>
        {
          isEmpty(earnTokenInfo) ? '' : (
            <>
              <Form.Item name="earnNumber" label="Stake Number" rules={[{ required: true, message: 'Please input your earn token number!'  }]}>
                <Input placeholder="Please input you earn token number" />
              </Form.Item>
              <StyleTokenInfoRow>
                <Row>
                  <Col span={layout.labelCol.span}></Col>
                  <Col span={layout.wrapperCol.span}>
                    <StyleTokenInfoCol>
                      <Space>
                        <StyleTokenInfoCol>
                          <Jazzicon address={account}></Jazzicon>
                        </StyleTokenInfoCol>
                        <span>{earnTokenInfo.name}({earnTokenInfo.symbol})</span>
                        <span>decimals: {earnTokenInfo.decimals}</span>
                      </Space>
                    </StyleTokenInfoCol>
                  </Col>
                </Row>
              </StyleTokenInfoRow>
            </>
          )
        }
        <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
          <Space direction="vertical" size={12}>
            <DatePicker showTime={{ format: 'HH:mm' }} onChange={onChangeStart} defaultValue={moment(defaultValueTime[0], dateFormat)} />
          </Space>
        </Form.Item>
        <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
          <Space direction="vertical" size={12}>
            <DatePicker showTime={{ format: 'HH:mm' }} onChange={onChangeEnd} defaultValue={moment(defaultValueTime[1], dateFormat)} />
          </Space>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Fragment>
  );
};

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, reset } = useWallet()

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
    reset()
  }, [onDismiss, reset])

  const sushi = useSushi()
  const sushiBalance = useTokenBalance(getSushiAddress(sushi))

  return (
    <Modal>
      <ModalTitle text="Create Pool" />
      <ModalContent>
        <Spacer />
        <CreatePool></CreatePool>
        <Spacer />
      </ModalContent>
    </Modal>
  )
}

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`

const StyleTokenInfoRow = styled.section`
  margin: 0 0 24px 0;
`

const StyleTokenInfoCol = styled.section`
  display: flex;
  align-items: center;
`

export default AccountModal
