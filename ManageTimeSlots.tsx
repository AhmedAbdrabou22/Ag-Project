import AgentBadge from "@/components/ManageApp/AgentBadge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogActionTrigger, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/Divider";
import FaIcon from "@/components/ui/FaIcon";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { IAgent } from "@/interfaces/agent.interface";
import { ICoverageArea } from "@/interfaces/coverage-area";
import { ISlotWorkingArea, IWorkingAreaSlotWithAgents } from "@/interfaces/working-area.interface";
import { getFetcher, postFetcher } from "@/utils/API/fetcher";
import { Box, Flex, HStack, Tag, Text, VStack, IconButton, Group, Badge, NumberInput, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import '../../styles/react-time-picker.css';
import { NonStatusLogsTable } from "../Customers/CustomersDetails";


interface PlaceSectionProps {
  place: IWorkingAreaSlotWithAgents;
  setSlotWorkingAreaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpenAssignAgent: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedWorkingAreaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpenDeleteWorkingArea: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedAgentId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpenDeleteAgent: React.Dispatch<React.SetStateAction<boolean>>;
}

function PlaceSection({ place, setSlotWorkingAreaId, setIsOpenAssignAgent, setSelectedWorkingAreaId, setIsOpenDeleteWorkingArea, setIsOpenDeleteAgent, setSelectedAgentId }: PlaceSectionProps) {

  return (
    <Box mb={4} pb={'1.5rem'} borderBottom={'1px solid'} borderColor={'ironGray.200'}>
      <Flex gap={'1.5rem'}>
        <HStack mb={2} alignSelf={'start'}>
          <Tag.Root bg={'white'} borderColor={'ironGray.300'} borderRadius="full" padding={'0.25rem 0.25rem 0.25rem 0.5rem'}>
            <Tag.Label color={'brand.700'} fontSize={'0.875rem'} fontWeight={500}>
              {place.Working_area.name}
            </Tag.Label>
            <Tag.EndElement>
              <Tag.CloseTrigger cursor={'pointer'} onClick={() => {
                setIsOpenDeleteWorkingArea(true);
                setSelectedWorkingAreaId(place.Working_area.slot_working_area_id)
              }} />
            </Tag.EndElement>
          </Tag.Root>
        </HStack>

        <Flex wrap="wrap" gap={'0.5rem'}>
          {place.agents.map(({ agent, agent_slot_working_area_id }) => (
            <Box alignSelf={'start'} key={agent.id}>
              <AgentBadge name={`${agent.first_name} ${agent.last_name}`} avatar={agent.avatar} onClick={() => {
                setIsOpenDeleteAgent(true);
                setSelectedAgentId(agent_slot_working_area_id);
              }} />
            </Box>
          ))}
          <Box>
            <Badge cursor={'pointer'} color="ironGray.600" variant={'plain'} onClick={() => {
              setSlotWorkingAreaId(place.Working_area.slot_working_area_id);
              setIsOpenAssignAgent(true);
            }}>
              <FaIcon className="fa-solid fa-plus" color="ironGray.600" />
              Assign Agent</Badge>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}


const slotsApiUrl = `/slots/all`;
export default function ManageTimeSlots() {
  const [slots, setSlots] = useState<ISlotWorkingArea[]>([]);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);

  const [addHourValue, setAddHourValue] = useState(0);
  const [addMinuteValue, setAddMinuteValue] = useState(0);
  const [addIsPMValue, setAddIsPMValue] = useState(false);

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenAssignPlace, setIsOpenAssignPlace] = useState(false);
  const [isOpenAssignAgent, setIsOpenAssignAgent] = useState(false);
  const [selectedAreasIds, setSelectedAreasIds] = useState<string[]>([]);
  const [selectedAgentsIds, setSelectedAgentsIds] = useState<string[]>([]);
  const [selectedWorkingAreaId, setSelectedWorkingAreaId] = useState<string | null>(null);
  const [isOpenDeleteWorkingArea, setIsOpenDeleteWorkingArea] = useState(false);
  const [isOpenAddHiddenTime, setIsOpenAddHiddenTime] = useState(false);
  const [startDateValue, setStartDateValue] = useState<Date>(new Date());
  const [endDateValue, setEndDateValue] = useState<Date>(new Date());
  const [hiddenSlotStartDate, setHiddenSlotStartDate] = useState<string>('');
  const [hiddenSlotEndDate, setHiddenSlotEndDate] = useState<string>('');
  const [hiddenSlotStartTime, setHiddenSlotStartTime] = useState<string>('');
  const [hiddenSlotEndTime, setHiddenSlotEndTime] = useState<string>('');
  const [isOpenDeleteHiddenSlot, setIsOpenDeleteHiddenSlot] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [selectedHiddenSlotId, setSelectedHiddenSlotId] = useState<string | null>(null);

  const [isOpenDeleteAgent, setIsOpenDeleteAgent] = useState(false);
  const [slotWorkingAreaId, setSlotWorkingAreaId] = useState<string | null>(null);

  const selectedSlot = slots[selectedSlotIdx];

  const [slotStatus, setSlotStatus] = useState(false);

  const { data: allSlotsResponse } = useSWR(
    slotsApiUrl,
    getFetcher<{ data: ISlotWorkingArea[] }>);

  const allSlots = allSlotsResponse?.data;


  const { trigger: triggerCreate, isMutating: isMutatingCreate } = useSWRMutation(`/slots`, postFetcher);
  const { trigger: triggerDelete, isMutating: isMutatingDelete } = useSWRMutation(selectedSlot ? `DELETE:/slots/${selectedSlot.id}` : null, postFetcher);
  const { trigger: triggerEdit, isMutating: isMutatingEdit } = useSWRMutation(`PUT:/slots/update`, postFetcher);
  const { trigger: triggerAddSlotWorkingArea, isMutating: isMutatingAddSlotWorkingArea } = useSWRMutation(`/slots/add-slot-working-area`, postFetcher);
  const { trigger: triggerAddAgentToWorkingArea, isMutating: isMutatingAgentToWorkingArea } = useSWRMutation(`/slots/add-agents-to-slot-working-area`, postFetcher);
  const { trigger: triggerDeleteWorkingArea, isMutating: isMutatingDeleteWorkingArea } = useSWRMutation(selectedWorkingAreaId ? `DELETE:/slots/delete-slot-working-area/${selectedWorkingAreaId}` : null, postFetcher);
  const { trigger: triggerDeleteAgent, isMutating: isMutatingDeleteAgent } = useSWRMutation(selectedAgentId ? `DELETE:/slots/agent-slot-working-area/${selectedAgentId}` : null, postFetcher);
  const { trigger: triggerAddHiddenSlot, isMutating: isMutatingAddHiddenSlot } = useSWRMutation(`/slots/add-vacancy`, postFetcher);
  const { trigger: triggerDeleteHiddenSlot, isMutating: isMutatingDeleteHiddenSlot } = useSWRMutation(selectedHiddenSlotId ? `DELETE:/slots/delete-vacancy/${selectedHiddenSlotId}` : null, postFetcher);


  const { data: areasResponse } = useSWR(
    '/admin/address/working-area',
    getFetcher<{ data: { data: ICoverageArea[]; } }>);
  const areas = areasResponse?.data?.data;


  const { data: agentsResponse } = useSWR(
    slotWorkingAreaId ? `/agent/all` : null,
    getFetcher<{ data: IAgent[] }>
  );

  const agents = agentsResponse?.data || [];




  const onHourChange = (value: string) => {
    if (value === '') {
      setHour(0);
      return;
    }
    const parsedValue = parseInt(value);
    if (parsedValue > 12) {
      setIsPM(true);
    } else {
      setIsPM(false);
    }
    if (parsedValue > 24) {
      setHour(24);
      return
    }
    if (parsedValue < 0) {
      setHour(0);
      return
    }
    setHour(parsedValue)
  }

  const onMinuteChange = (value: string) => {
    if (value === '') {
      setMinute(0);
      return;
    }
    const parsedValue = parseInt(value);
    if (parsedValue > 60) {
      setMinute(60);
      return
    }
    if (parsedValue < 0) {
      setMinute(0);
      return
    }
    setMinute(parsedValue)
  }

  const onAddHourValueChange = (value: string) => {
    if (value === '') {
      setAddHourValue(0);
      return;
    }
    const parsedValue = parseInt(value);
    if (parsedValue > 12) {
      setAddIsPMValue(true);
    } else {
      setAddIsPMValue(false);
    }
    if (parsedValue > 24) {
      setAddHourValue(23);
      return
    }
    if (parsedValue < 0) {
      setAddHourValue(0);
      return
    }
    setAddHourValue(parsedValue)
  }

  const onAddMinuteValueChange = (value: string) => {
    if (value === '') {
      setAddMinuteValue(0);
      return;
    }
    const parsedValue = parseInt(value);
    if (parsedValue > 60) {
      setAddMinuteValue(59);
      return
    }
    if (parsedValue < 0) {
      setAddMinuteValue(0);
      return
    }
    setAddMinuteValue(parsedValue)
  }

  const onAddSlot = () => {
    setIsOpenAdd(true);
  }

  const onConfirmAdd = async () => {
    const minutes = addMinuteValue < 10 ? `0${addMinuteValue}` : addMinuteValue;
    const formatTo12Hour = (hour24: number, minute: number) => {
      const period = hour24 >= 12 ? 'PM' : 'AM';
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      const mm = minute < 10 ? `0${minute}` : `${minute}`;
      return `${hour12}:${mm} ${period}`;
    };
    const normalizedStartTime = formatTo12Hour(addHourValue, addMinuteValue);
    const body = {
      // start_time: normalizedStartTime,
      start_time: `${addHourValue}:${minutes} ${addIsPMValue ? 'PM' : 'AM'}`,
      is_active: true,
      name: normalizedStartTime
    }

    try {
      const res = await triggerCreate(body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenAdd(false);
        toaster.create({
          title: 'Success',
          description: 'Slot created successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error creating Slot ${error}`,
        type: 'Error',
      })
    }
  }

  const onDeleteSlot = () => {
    setIsOpenDelete(true);
  }

  const onConfirmDelete = async () => {
    try {
      const res = await triggerDelete();
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenDelete(false);
        toaster.create({
          title: 'Success',
          description: 'Slot deleted successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error deleting Slot ${error}`,
        type: 'Error',
      })
    }
  }

  const onUpdateSlot = async () => {
    const minutes = minute < 10 ? `0${minute}` : minute;
    const formatTo12Hour = (hour24: number, minuteValue: number) => {
      const period = hour24 >= 12 ? 'PM' : 'AM';
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      const mm = Number(minuteValue) < 10 ? `0${minuteValue}` : `${minuteValue}`;
      return `${hour12}:${mm} ${period}`;
    };
    const normalizedStartTime = formatTo12Hour(hour, Number(minutes));
    const body = {
      id: selectedSlot.id,
      // start_time: normalizedStartTime,
      start_time: `${hour}:${minutes} ${isPM ? 'PM' : 'AM'}`,
      is_active: slotStatus,
      name: normalizedStartTime
    }

    try {
      const res = await triggerEdit(body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        toaster.create({
          title: 'Success',
          description: 'Slot updated successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error updating Slot ${error}`,
        type: 'Error',
      })
    }
  }

  const onAddSlotWorkingArea = async () => {
    const body = {
      slot_id: selectedSlot.id,
      working_area_ids: selectedAreasIds
    }

    try {
      const res = await triggerAddSlotWorkingArea(body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenAssignPlace(false);
        toaster.create({
          title: 'Success',
          description: 'Slot updated successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error updating Slot ${error}`,
        type: 'Error',
      })
    }
  }

  const onAddAgentToWorkingArea = async () => {
    const body = {
      slot_working_area_id: slotWorkingAreaId,
      agent_ids: selectedAgentsIds
    }

    try {
      const res = await triggerAddAgentToWorkingArea(body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenAssignAgent(false);
        toaster.create({
          title: 'Success',
          description: 'Working Area updated successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error updating Working Area ${error}`,
        type: 'Error',
      })
    }
  }

  const onConfirmDeleteWorkingArea = async () => {
    try {
      const res = await triggerDeleteWorkingArea();
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenDeleteWorkingArea(false);
        toaster.create({
          title: 'Success',
          description: 'WorkingArea deleted successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error deleting WorkingArea ${error}`,
        type: 'Error',
      })
    }
  }

  const onConfirmDeleteAgent = async () => {
    try {
      const res = await triggerDeleteAgent();
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenDeleteAgent(false);
        toaster.create({
          title: 'Success',
          description: 'Agent removed successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error removing agent ${error}`,
        type: 'Error',
      })
    }
  }

  const onAddHiddenSlot = async () => {
    const body = {
      start_date: `${hiddenSlotStartDate}T${hiddenSlotStartTime}:00.000Z`,
      end_date: `${hiddenSlotEndDate}T${hiddenSlotEndTime}:00.000Z`,
      id: selectedSlot.id
    }

    try {
      const res = await triggerAddHiddenSlot(body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenAddHiddenTime(false);
        setHiddenSlotStartDate('');
        setHiddenSlotEndDate('');
        setHiddenSlotStartTime('');
        setHiddenSlotEndTime('');
        setStartDateValue(new Date());
        setEndDateValue(new Date());
        toaster.create({
          title: 'Success',
          description: 'Hidden Slot created successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error creating Hidden Slot ${error}`,
        type: 'Error',
      })
    }
  }

  const onConfirmDeleteHiddenSlot = async () => {
    try {
      const res = await triggerDeleteHiddenSlot();
      if (res.statusCode === 201 || res.statusCode === 200) {
        mutate(slotsApiUrl);
        setIsOpenDeleteHiddenSlot(false);
        toaster.create({
          title: 'Success',
          description: 'Hidden time removed successfully',
          type: 'success',
        })
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: `Error removing hidden time ${error}`,
        type: 'Error',
      })
    }
  }

  useEffect(() => {
    if (allSlots && allSlots.length > 0) {
      const currentSelectedSlotId = slots[selectedSlotIdx]?.id;
      setSlots(allSlots);
      
      // Try to maintain the current selection by finding the slot with the same ID
      if (currentSelectedSlotId) {
        const newSelectedIndex = allSlots.findIndex(slot => slot.id === currentSelectedSlotId);
        if (newSelectedIndex !== -1) {
          setSelectedSlotIdx(newSelectedIndex);
          setSlotStatus(allSlots[newSelectedIndex].is_active || false);
        } else {
          // If the current slot was deleted, fall back to first slot
          setSelectedSlotIdx(0);
          setSlotStatus(allSlots[0].is_active || false);
        }
      } else {
        // Initial load - select first slot
        setSelectedSlotIdx(0);
        setSlotStatus(allSlots[0].is_active || false);
      }
    }
  }, [allSlots]);

  useEffect(() => {
    if (selectedSlot) {
      setHour(parseInt(selectedSlot.start_time.trim().split(":")[0]) || 0);
      setMinute(parseInt(selectedSlot.start_time.trim().split(":")[1]) || 0);
      setIsPM(parseInt(selectedSlot.start_time.trim().split(":")[0]) >= 12);
      setSlotStatus(selectedSlot.is_active || false);
    }
  }, [selectedSlot]);


  // Code From Ahmed Abdrabou For (Local Time Riyad)
  const formatToSaudiTime = (isoString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Date(isoString).toLocaleString('en-US', options);
  };




  return (
    <Box>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text fontWeight="600" fontSize='1.25rem' color={'brand.500'}>Available Service Time</Text>
        <Button variant="outline" onClick={() => onAddSlot()}>
          <FaIcon className={'fa-solid fa-plus'} />
          Add Slot
        </Button>
      </Flex>
      <Divider my={'1.5rem'} />

      <Flex gap={'0.75rem'} mb={6} wrap="wrap">
        {slots.map((slot, idx) => (
          <Box
            key={slot.id}
            border={'1px solid'}
            borderRadius="0.5rem"
            padding={'0.75rem'}
            minW="12rem"
            cursor="pointer"
            bg={'white'}
            borderColor={selectedSlotIdx === idx ? 'brand.600' : 'ironGray.200'}
            onClick={() => setSelectedSlotIdx(idx)}
          >
            <Text fontWeight="500" fontSize={'0.875rem'} color={'brand.500'}>{slot.name}</Text>

            <Text fontSize="0.75rem" fontWeight="500" textOverflow={'ellipsis'} color={'ironGray.500'}>{slot.number_of_working_areas} Places, {slot.number_of_unique_agents} Agents</Text>
          </Box>
        ))}

      </Flex>
      <Flex gap={6}>
        {/* Slot Details */}
        <Box alignSelf={'start'} flex={1} border={'1px solid'} borderColor={'ironGray.200'} borderRadius="1rem" p={'1.5rem'} bg="white" maxW="320px">
          <VStack align="stretch" gap={4}>
            <HStack justifyContent={'space-between'}>
              <Text color={'ironGray.700'} fontSize={'0.875rem'} fontWeight={'500'}>Time Setting</Text>
              <Badge colorPalette={slotStatus ? 'green' : 'red'} borderRadius={'full'} border={'1px solid'} borderColor={slotStatus ? 'success.200' : 'error.200'}>{slotStatus ? 'Active' : 'Inactive'}</Badge>
            </HStack>

            <HStack alignItems={'start'} justifyContent={'space-between'}>
              <VStack>
                <NumberInput.Root>
                  <NumberInput.Input textAlign={'center'} maxW="60px" borderRadius={'0.5rem'} border={'1px solid'} borderColor={'ironGray.300'} padding={'0.625rem 0.875rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} value={hour} onChange={(e) => onHourChange(e.target.value)} min={0} max={24} />
                </NumberInput.Root>
                <Text color={'ironGray.600'} fontSize={'0.75rem'} fontWeight={'500'}>Hour</Text>
              </VStack>
              <VStack>
                <NumberInput.Root>
                  <NumberInput.Input textAlign={'center'} maxW="60px" borderRadius={'0.5rem'} border={'1px solid'} borderColor={'ironGray.300'} padding={'0.625rem 0.875rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} value={minute} onChange={(e) => onMinuteChange(e.target.value)} min={0} max={60} />
                </NumberInput.Root>
                <Text color={'ironGray.600'} fontSize={'0.75rem'} fontWeight={'500'}>Minute</Text>
              </VStack>

              <Group attached border={'1px solid'} borderColor={'ironGray.300'} borderRadius={'0.5rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} >
                <Button variant="ghost" borderRight={'1px solid'} borderRightColor={'ironGray.300'} onClick={() => setIsPM(false)} bg={isPM ? 'white' : 'ironGray.100'}>AM</Button>
                <Button variant="ghost" onClick={() => setIsPM(true)} bg={isPM ? 'ironGray.100' : 'white'}>PM</Button>
              </Group>

            </HStack>
            <Divider my="1rem" />
            <HStack justifyContent={'space-between'}>
              <HStack>
                <Text color={'ironGray.700'} fontSize={'0.875rem'} fontWeight={'500'}>Status</Text>
                {/* <Badge colorPalette={slotStatus ? 'green' : 'red'} borderRadius={'full'} border={'1px solid'} borderColor={slotStatus ? 'success.200' : 'error.200'}>{slotStatus ? 'Active' : 'Inactive'}</Badge> */}
              </HStack>
              <Switch checked={slotStatus} onCheckedChange={(e) => {
                if (!selectedSlot) return;

                setSlotStatus(!!e.checked);
                // Auto-update the slot when status changes
                const minutes = minute < 10 ? `0${minute}` : minute;
                const formatTo12Hour = (hour24: number, minuteValue: number) => {
                  const period = hour24 >= 12 ? 'PM' : 'AM';
                  let hour12 = hour24 % 12;
                  if (hour12 === 0) hour12 = 12;
                  const mm = Number(minuteValue) < 10 ? `0${minuteValue}` : `${minuteValue}`;
                  return `${hour12}:${mm} ${period}`;
                };
                const normalizedStartTime = formatTo12Hour(hour, Number(minutes));
                const body = {
                  id: selectedSlot.id,
                  start_time: normalizedStartTime,
                  is_active: !!e.checked,
                  name: normalizedStartTime
                };

                triggerEdit(body).then((res) => {
                  if (res.statusCode === 201 || res.statusCode === 200) {
                    mutate(slotsApiUrl);
                    toaster.create({
                      title: 'Success',
                      description: 'Slot status updated successfully',
                      type: 'success',
                    });
                  }
                }).catch((error) => {
                  toaster.create({
                    title: 'Error',
                    description: `Error updating slot status: ${error}`,
                    type: 'Error',
                  });
                  // Revert the status if update fails
                  setSlotStatus(!e.checked);
                });
              }} />
            </HStack>
            <HStack justifyContent={'space-between'}>
              <Text color={'ironGray.700'} fontSize={'0.875rem'} fontWeight={'500'}>Hide Slot</Text>
              <Button size={'xs'} onClick={() => setIsOpenAddHiddenTime(true)}>Add Hide Slot</Button>
            </HStack>
            {/* <HStack justifyContent={'space-between'}>
              <Button colorPalette="red" variant="plain" borderRadius={'0.5rem'} border={'1px solid'} borderColor={'red.200'} onClick={onDeleteSlot}>Delete</Button>
              <Button onClick={onUpdateSlot} loading={isMutatingEdit}>Update Slot</Button>
            </HStack> */}
            <HStack justifyContent="space-between" gap={4} w="100%">
              <Button
                flex={1}
                colorPalette="red"
                variant="plain"
                borderRadius="0.5rem"
                border="1px solid"
                borderColor="red.200"
                onClick={onDeleteSlot}
              >
                Delete
              </Button>
              <Button flex={1} onClick={onUpdateSlot} loading={isMutatingEdit}>
                Update Slot
              </Button>
            </HStack>

          </VStack>
        </Box>
        {/* Assigned Places & Agents */}
        <Flex flexDir={'column'} flex={2} gap={'1.5rem'}>

          <Box border={'1px solid'} borderColor={'ironGray.200'} borderRadius="1rem" p={'1.5rem'} bg="white">
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text color={'ironGray.700'} fontSize={'0.875rem'} fontWeight={'600'}>Assigned Places</Text>
              <IconButton variant={'plain'} onClick={() => setIsOpenAssignPlace(true)}>
                <FaIcon className={'fa-solid fa-plus'} />
              </IconButton>
            </Flex>
            <Divider mt={'1rem'} mb={'2rem'} />

            {selectedSlot?.slots_working_areas.map((workingArea) => (

              <PlaceSection
                key={workingArea.Working_area.id}
                place={workingArea}
                setSlotWorkingAreaId={setSlotWorkingAreaId}
                setIsOpenAssignAgent={setIsOpenAssignAgent}
                setSelectedWorkingAreaId={setSelectedWorkingAreaId}
                setIsOpenDeleteWorkingArea={setIsOpenDeleteWorkingArea}
                setSelectedAgentId={setSelectedAgentId}
                setIsOpenDeleteAgent={setIsOpenDeleteAgent}
              />
            ))}
          </Box>

          <Box border={'1px solid'} borderColor={'ironGray.200'} borderRadius="1rem" p={'1.5rem'} bg="white">
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text color={'ironGray.700'} fontSize={'0.875rem'} fontWeight={'600'}>Hidden Times</Text>
              <IconButton variant={'plain'} onClick={() => setIsOpenAddHiddenTime(true)}>
                <FaIcon className={'fa-solid fa-plus'} />
              </IconButton>
            </Flex>
            <Divider mt={'1rem'} mb={'2rem'} />
            <Flex gap={'0.75rem'} wrap="wrap">

              {
                selectedSlot?.vacancies.length > 0 ? selectedSlot?.vacancies.map((vacancy, indx) => (
                  <Flex justifyItems={'start'} gap={'1rem'} key={indx} bg={'ironGray.50'} padding={'0.75rem'} borderRadius={'0.5rem'}>
                    <Text color={'ironGray.600'} fontSize={'0.75rem'} fontWeight={'500'}>
                      {/* <Text as={'span'} mb={'1'}>{vacancy.start_date.split('T')[0]} {vacancy.start_date.split('T')[1].split(':')[0]}:{vacancy.start_date.split('T')[1].split(':')[1]} {vacancy.start_date.split('T')[1].split(':')[0] >= '12' ? 'PM' : 'AM'} </Text> */}

                      <Text as="span" mb="1">
                        {formatToSaudiTime(vacancy.start_date)}
                      </Text>


                      {/* <Text as={'span'}>{vacancy.end_date.split('T')[0]} {vacancy.end_date.split('T')[1].split(':')[0]}:{vacancy.end_date.split('T')[1].split(':')[1]} {vacancy.end_date.split('T')[1].split(':')[0] >= '12' ? 'PM' : 'AM'}</Text> */}
                      <Text as="span" mx="1">
                        {formatToSaudiTime(vacancy.end_date)}
                      </Text>

                    </Text>
                    <FaIcon className={'fa-solid fa-xmark'} cursor={'pointer'} onClick={() => {
                      setSelectedHiddenSlotId(vacancy.id);
                      setIsOpenDeleteHiddenSlot(true);
                    }} />
                  </Flex>
                )) : <Text fontSize="0.75rem" fontWeight="500" color={'ironGray.500'}>There Is No Hidden Times</Text>
              }
            </Flex>

          </Box>
        </Flex>
      </Flex>

      <Box mt={'16px'}>
        <Button variant={'plain'} color={'brand.700'} fontSize={'14px'} fontWeight={500} onClick={() => setIsLogsOpen(!isLogsOpen)}>
          <FaIcon className={'fa-light fa-rectangle-history-circle-user'} /> {isLogsOpen ? 'Hide' : 'Show'} logs
        </Button>
      </Box>

      {isLogsOpen && (
        <Box mt={'24px'}>
          <NonStatusLogsTable history={selectedSlot?.history || []} />
        </Box>
      )}


      {/* Add Slot */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xs'} lazyMount open={isOpenAdd} onOpenChange={(e) => {
        setIsOpenAdd(e.open)
        setAddHourValue(0);
        setAddMinuteValue(0);
        setAddIsPMValue(false);
      }} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'.5rem'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Text>
                Add Slot
              </Text>
            </Flex>
          </DialogHeader>
          <DialogBody>

            <HStack alignItems={'start'} justifyContent={'space-between'}>
              <VStack>
                <NumberInput.Root>
                  <NumberInput.Input  textAlign={'center'} maxW="60px" borderRadius={'0.5rem'} border={'1px solid'} borderColor={'ironGray.300'} padding={'0.625rem 0.875rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} value={addHourValue} onChange={(e) => onAddHourValueChange(e.target.value)} min={0} max={23} />
                </NumberInput.Root>
                <Text color={'ironGray.600'} fontSize={'0.75rem'} fontWeight={'500'}>Hour</Text>
              </VStack>
              <VStack>
                <NumberInput.Root>
                  <NumberInput.Input textAlign={'center'} maxW="60px" borderRadius={'0.5rem'} border={'1px solid'} borderColor={'ironGray.300'} padding={'0.625rem 0.875rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} value={addMinuteValue} onChange={(e) => onAddMinuteValueChange(e.target.value)} min={0} max={59} />
                </NumberInput.Root>
                <Text color={'ironGray.600'} fontSize={'0.75rem'} fontWeight={'500'}>Minute</Text>
              </VStack>

              <Group attached border={'1px solid'} borderColor={'ironGray.300'} borderRadius={'0.5rem'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} >
                <Button variant="ghost" borderRight={'1px solid'} borderRightColor={'ironGray.300'} onClick={() => setAddIsPMValue(false)} bg={addIsPMValue ? 'white' : 'ironGray.100'}>AM</Button>
                <Button variant="ghost" onClick={() => setAddIsPMValue(true)} bg={addIsPMValue ? 'ironGray.100' : 'white'}>PM</Button>
              </Group>

            </HStack>
          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingCreate}
              // bg={'error.600'}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onConfirmAdd}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Slot  */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xs'} lazyMount open={isOpenDelete} onOpenChange={(e) => setIsOpenDelete(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'error.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-trash-arrow-up" color="error.600" fontSize="1.25rem" />
              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Delete Slot
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Are you sure you want to delete this slot?
            </Text>
          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingDelete}
              bg={'error.600'}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onConfirmDelete}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Assign Place */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'sm'} lazyMount open={isOpenAssignPlace} onOpenChange={(e) => setIsOpenAssignPlace(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'ironGray.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-map" color="brand.600" fontSize="1.25rem" />

              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Assign Place
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Manage Slot and areas of service
            </Text>

            <Flex mt={'1.5rem'} flexDirection={'column'} gap={'1.5rem'} bg={'ironGray.25'} border={'1px solid'} padding={'1rem'} borderColor={'ironGray.200'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} borderRadius={'0.75rem'}>
              {
                areas?.map((area, idx) => (
                  // remove border when last element

                  // borderBottom={areas.length - 1 === i ? 'none' : '1px solid'}
                  <HStack key={area.id} justifyContent={'space-between'} paddingBottom={'1rem'} borderBottom={areas.length - 1 === idx ? 'none' : '1px solid'} borderColor={'ironGray.200'} flex={1}>
                    <HStack>

                      <Checkbox
                        defaultChecked={false}
                        onCheckedChange={(e) => {
                          if (e.checked) {
                            setSelectedAreasIds((prev) => [...prev, area.id]);
                          } else {
                            setSelectedAreasIds((prev) => prev.filter((id) => id !== area.id));
                          }
                        }}
                      >
                        <Text fontSize={'0.875rem'} fontWeight={'500'} color="ironGray.600">
                          {area.name}
                        </Text>
                      </Checkbox>

                    </HStack>
                    <Text fontSize={'0.75rem'} fontWeight={'400'} color="ironGray.600">
                      {area.unique_agent_count} Agent
                    </Text>
                  </HStack>
                ))
              }

            </Flex>

          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingAddSlotWorkingArea}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onAddSlotWorkingArea}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Assign Agent */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'sm'} lazyMount open={isOpenAssignAgent} onExitComplete={() => setSelectedAgentsIds([])} onOpenChange={(e) => setIsOpenAssignAgent(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'ironGray.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-map" color="brand.600" fontSize="1.25rem" />

              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Assign Place
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Manage Slot and areas of service
            </Text>

            <Flex mt={'1.5rem'} flexDirection={'column'} gap={'1.5rem'} bg={'ironGray.25'} border={'1px solid'} padding={'1rem'} borderColor={'ironGray.200'} boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'} borderRadius={'0.75rem'} maxHeight={'300px'} overflowY={'auto'}>
              {
                agents?.map((agent, idx) => (
                  <HStack key={agent.id} justifyContent={'space-between'} paddingBottom={'1rem'} borderBottom={agents.length - 1 === idx ? 'none' : '1px solid'} borderColor={'ironGray.200'} flex={1} >
                    <HStack>

                      <Checkbox
                        defaultChecked={false}
                        onCheckedChange={(e) => {
                          if (e.checked) {
                            setSelectedAgentsIds((prev) => [...prev, agent.id]);
                          } else {
                            setSelectedAgentsIds((prev) => prev.filter((id) => id !== agent.id));
                          }
                        }}
                      >
                        <HStack>
                          <Avatar src={agent.user.avatar || ''} width={'1rem'} height={'1rem'} />
                          <Text fontSize={'0.875rem'} fontWeight={'500'} color="ironGray.600">
                            {agent.user.first_name} {agent.user.last_name}
                          </Text>
                        </HStack>
                      </Checkbox>

                    </HStack>
                  </HStack>
                ))
              }

            </Flex>

          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingAgentToWorkingArea}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onAddAgentToWorkingArea}
            >
              Add Agents
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete WorkingArea */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xs'} lazyMount open={isOpenDeleteWorkingArea} onOpenChange={(e) => setIsOpenDeleteWorkingArea(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'error.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-trash-arrow-up" color="error.600" fontSize="1.25rem" />
              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Delete Working Area
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Are you sure you want to delete this Working Area?
            </Text>
          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingDeleteWorkingArea}
              bg={'error.600'}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onConfirmDeleteWorkingArea}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Agent */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xs'} lazyMount open={isOpenDeleteAgent} onOpenChange={(e) => setIsOpenDeleteAgent(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'error.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-trash-arrow-up" color="error.600" fontSize="1.25rem" />
              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Remove Agent
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Are you sure you want to remove agent from this Working Area?
            </Text>
          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingDeleteAgent}
              bg={'error.600'}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onConfirmDeleteAgent}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Add Hidden Slot */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xl'} lazyMount open={isOpenAddHiddenTime} onOpenChange={(e) => setIsOpenAddHiddenTime(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'ironGray.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-calendar-exclamation" color="brand.500" fontSize="1.25rem" />
              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Hidden Times
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Manage availability of service slots
            </Text>
          </DialogBody>

          <Flex gap={'1.5rem'} padding={'2.5rem'} justifyContent={'space-between'} alignItems={'center'}>
            <Flex direction={'column'}>
              <Calendar
                onChange={(value) => {
                  if (value) {
                    if (value instanceof Date) {
                      setStartDateValue(value);
                    }
                    const selectedDate = new Date(value.toString());
                    selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
                    const localDate = selectedDate.toISOString().split('T')[0];
                    setHiddenSlotStartDate(localDate);
                  }
                }}
                value={startDateValue}
                nextLabel={<FaIcon className="fa-light fa-chevron-right" />}
                prevLabel={<FaIcon className="fa-light fa-chevron-left" />}
                next2Label={null}
                prev2Label={null}
              />
              <Flex gap={'1.5rem'}>
                <Box w={'50%'}>
                  <Input placeholder="selected date" readOnly value={hiddenSlotStartDate} />
                </Box>
                <Box w="50%">
                  <TimePicker
                    value={hiddenSlotStartTime}
                    onChange={(value) => {
                      if (value) {
                        setHiddenSlotStartTime(value);
                      }
                    }}
                    disableClock
                    clearIcon={null}
                    className="chakra-time-picker"
                  />
                </Box>
              </Flex>
            </Flex>

            <Flex direction={'column'}>
              <Calendar
                onChange={(value) => {
                  if (value) {
                    if (value instanceof Date) {
                      setEndDateValue(value);
                    }
                    const selectedDate = new Date(value.toString());
                    selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
                    const localDate = selectedDate.toISOString().split('T')[0];
                    setHiddenSlotEndDate(localDate);
                  }
                }}
                value={endDateValue}
                nextLabel={<FaIcon className="fa-light fa-chevron-right" />}
                prevLabel={<FaIcon className="fa-light fa-chevron-left" />}
                next2Label={null}
                prev2Label={null}

              />
              <Flex gap={'1.5rem'}>
                <Box w={'50%'}>
                  <Input placeholder="selected date" readOnly value={hiddenSlotEndDate} />
                </Box>
                <Box w="50%">
                  <TimePicker
                    value={hiddenSlotEndTime}
                    onChange={(value) => {
                      if (value) {
                        setHiddenSlotEndTime(value);
                      }

                    }}

                    disableClock
                    clearIcon={null}
                    className="chakra-time-picker"
                  />
                </Box>
              </Flex>
            </Flex>
          </Flex>

          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingAddHiddenSlot}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onAddHiddenSlot}
            >
              Add Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>



      {/* Delete Hidden Slot */}
      <DialogRoot closeOnEscape={false} closeOnInteractOutside={false} size={'xs'} lazyMount open={isOpenDeleteHiddenSlot} onOpenChange={(e) => setIsOpenDeleteHiddenSlot(e.open)} initialFocusEl={() => null}>
        <DialogBackdrop background={"rgba(12 17 29, .7)"} backdropFilter={'blur(8px)'} />
        <DialogContent>
          <DialogHeader>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <DialogCloseTrigger mt={'spacing-lg'}>
                <FaIcon className="fa-light fa-xmark" color="brand.500" fontSize="1.25rem" />
              </DialogCloseTrigger>
              <Box width={'48px'} height={'48px'} bg={'error.100'} borderRadius={'50%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <FaIcon className="fa-light fa-trash-arrow-up" color="error.600" fontSize="1.25rem" />
              </Box>
            </Flex>
          </DialogHeader>
          <DialogBody>
            <Text color={'brand.500'} fontSize={'1.25rem'} fontWeight={600} mb={'spacing-xs'}>
              Remove Hidden Time
            </Text>
            <Text color={'ironGray.500'} fontSize={'.875rem'}>
              Are you sure you want to remove this hidden time?
            </Text>
          </DialogBody>
          <DialogFooter justifyContent={'space-between'} onClick={(e) => e.stopPropagation()}>
            <DialogActionTrigger asChild>
              <Button width={'50%'} variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              width={'50%'}
              loading={isMutatingDeleteHiddenSlot}
              bg={'error.600'}
              color={'white'}
              boxShadow={'0px 1px 2px 0px rgba(16, 24, 40, 0.05)'}
              onClick={onConfirmDeleteHiddenSlot}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

    </Box>
  );
}